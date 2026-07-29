import { useTask as useTaskOriginal } from 'vue-concurrency'
import { v4 as uuidv4 } from 'uuid'
import { isFunction } from 'lodash-es'
import type { AnyFn } from '@vueuse/core'
import type { UnwrapRef } from 'vue'
import { reactive } from 'vue'
import { nextTick } from 'vue'
import { watchEffect } from 'vue'

type Generator = Parameters<typeof useTaskOriginal>[0]

/**
 * @see https://github.com/MartinMalinda/vue-concurrency/issues/106
 */
export function useTask(
  cb: Generator | AsyncGenerator<unknown, unknown, unknown>,
  concurrency: 'drop' | 'restartable' | 'keepLatest' | null = 'drop',
) {
  const task = useTaskOriginal(cb as Generator)
  if (concurrency) {
    task[concurrency]()
  }
  return task
}

type UseAsyncOptions<Result> = {
  throwError?: boolean
  initial?: Result | (() => Result)
  enableConcurrentCheck?: boolean
  checkEmpty?: (x: Result) => boolean
}

type UseAsyncError = Error & {
  cause: {
    code: 'concurrent' | 'callback-execution-error'
    values: unknown
    cause: unknown
  }
}

/**
 * 获取异步函数的结果以及 loading、error 等执行状态
 */
export function useAsync<
  Result,
  Args extends unknown[] = [],
  Options extends UseAsyncOptions<Result> = Record<string, never>,
>(
  bindFuncOrPromise: Promise<Result> | ((...args: Args) => Promise<Result>),
  options?: Partial<Options>,
) {
  const isPromise = bindFuncOrPromise instanceof Promise

  const opts = Object.assign(
    {
      initial: null as Result,
      throwError: true,
      enableConcurrentCheck: false,
      checkEmpty: (res: Result) => !res,
    },
    options,
  )

  type ResultHook<Result> = (arg: UnwrapRef<Result>) => unknown
  type ErrorHook = (err: UseAsyncError, ...args: Args) => unknown

  const states = reactive({
    __isAsyncTask: true,
    id: uuidv4(),
    running: null as Promise<Result> | null,
    controllers: [] as AbortController[],
    isLoading: false,
    isError: false,
    isInited: false,
    isEmpty: false,
    // 函数执行结果
    result: isFunction(opts.initial)
      ? (opts.initial() as Result | null)
      : (opts.initial as Result | null),
    reset,
    // 主动触发函数执行，策略：并发
    exec,
    // 主动触发函数执行，策略：等待正在执行的任务的结果
    execOnce,
    // 主动触发函数执行，策略：执行新的任务，若超出并发数，终止正在运行的最早的一次的任务
    // parallels: 1,
    execNew,
    // 注册结果监听函数
    resultHook,
    // 注册出错监听函数
    errorHook,
    // * 业务代码中经常要判断多个条件，
    // * 比如 states.id 以及 states.isLoading 都满足特定条件才执行，
    // * 所以加一个辅助函数
    isLoadingAnd,
  })

  // watchEffect(() => {
  //   console.log('[debug] useAsync states.isLoading: ', states.isLoading)
  // })

  let generation = 0

  const _resultHookCB = [] as ResultHook<Result>[]
  const _errorHookCB = [] as ErrorHook[]

  function resultHook(cb: ResultHook<Result>) {
    _resultHookCB.push(cb)
    return states
  }
  async function execResultHook(res: UnwrapRef<Result>, currentGeneration: number) {
    for await (const cb of _resultHookCB) {
      if (currentGeneration !== generation) return res
      res = cb(res) as UnwrapRef<Result>
    }
    return res
  }
  function errorHook(cb: ErrorHook) {
    _errorHookCB.push(cb)
    return states
  }
  async function execErrorHook(err: UseAsyncError, ...args: Args) {
    for await (const cb of _errorHookCB) {
      await cb(err, ...args)
    }
  }

  function isLoadingAnd(cond: ((s: typeof states) => boolean) | boolean) {
    const isCond = isFunction(cond) ? cond(states) : cond
    return states.isLoading && isCond
  }

  const checkConcurrent = (...args: Args) => {
    if (!opts.enableConcurrentCheck) {
      return true
    }
    if (states.isLoading) {
      const err = new Error('[ERR] concurrent found in useAsync', {
        cause: { code: 'concurrent', values: [...args] },
      }) as UseAsyncError
      states.isError = true
      if (opts.throwError) {
        throw err
      }
      execErrorHook(err, ...args)
      // message.error("请等待上一次指令结束");
      console.log('[info] concurrent found in useAsync')
      return
    }
    return true
  }

  // 在下一个 Tick 执行注册的函数
  async function exec(...args: Args) {
    const currentGeneration = ++generation
    const controller = new AbortController()
    states.controllers.push(controller)

    const isValid = checkConcurrent(...args)
    if (!isValid) {
      return
    }

    states.isLoading = true

    // running/result/resolve 三者类型约束联动：收窄 resolve 会与 states.running（Promise<Result>）
    // 及 states.result（Result | null）声明矛盾，留待 running 状态机单独治理
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let execRunningResolve: any
    let onAbort: (() => void) | undefined
    states.running = new Promise((r) => (execRunningResolve = r))
    try {
      // 确保同一个宏任务中 useAsync().exec() 以及注册的钩子函数如 useAsync().resultHook() 的调用顺序，
      // 先执 useAsync().resultHook() 再执行 useAsync().exec()
      await nextTick()

      const handler = isFunction(bindFuncOrPromise) ? bindFuncOrPromise(...args) : bindFuncOrPromise

      const abortPromise = new Promise<never>((_, reject) => {
        onAbort = () => reject(new Error('Aborted'))
        if (controller.signal.aborted) {
          onAbort()
          return
        }
        controller.signal.addEventListener('abort', onAbort, { once: true })
      })

      const racedResult = await Promise.race([handler, abortPromise])
      if (currentGeneration !== generation) {
        return states.result
      }
      states.result = await execResultHook(racedResult as UnwrapRef<Result>, currentGeneration)
      states.isInited = true
    } catch (err) {
      if (currentGeneration !== generation) {
        return states.result
      }
      states.isError = true
      // console.log('Error -> ', err, err?.cause)

      const wrapErr = new Error((err as Error).message, {
        cause: {
          code: 'callback-execution-error',
          values: [...args],
          cause: err,
        },
      }) as UseAsyncError
      execErrorHook(wrapErr, ...args)
      if (opts.throwError) {
        throw wrapErr
      } else {
        console.log('[info] error found in useAsync.exec', err)
      }
    } finally {
      if (onAbort) {
        controller.signal.removeEventListener('abort', onAbort)
      }
      if (currentGeneration !== generation) {
        const idx = states.controllers.indexOf(controller)
        if (idx > -1) {
          states.controllers.splice(idx, 1)
        }
      } else {
        states.isLoading = false
        execRunningResolve!(states.result as unknown as Result | null)

        const idx = states.controllers.indexOf(controller)
        if (idx > -1) {
          states.controllers.splice(idx, 1)
        }
      }
    }
    // Why 过期任务丢弃 result：与原实现 finally 内 return undefined 的语义等价
    return currentGeneration !== generation ? undefined : states.result
  }

  async function execOnce(...args: Args) {
    if (states.isLoading) {
      await states.running
      return states.result
    } else {
      return exec(...args)
    }
  }

  async function execNew(...args: Args) {
    states.controllers.map((c) => c.abort())
    states.controllers = []
    return exec(...args)
  }

  watchEffect(() => {
    const res = states.result
    if (opts.checkEmpty) {
      states.isEmpty = states.isInited && opts.checkEmpty(res as Result)
    } else {
      states.isEmpty = states.isInited && (Array.isArray(res) ? res.length === 0 : !res)
    }
  })

  const fakeArgs = [] as unknown as Args
  if (isPromise) exec(...fakeArgs)

  function reset() {
    const isValid = checkConcurrent(...fakeArgs)
    if (!isValid) {
      return
    }
    states.isInited = false
    states.isLoading = false
    states.isError = false
    states.result = (
      isFunction(opts.initial) ? opts.initial() : opts.initial
    ) as UnwrapRef<Result> | null
    states.controllers.forEach((c) => c.abort())
    states.controllers = []
    _resultHookCB.length = 0
    _errorHookCB.length = 0
  }

  return states
}

/**
 * add after and prepare prop to useAsync,
 * later we can bring the it into useAsync itself when stable
 */
export const useAsyncFlow = (...args: Parameters<typeof useAsync>) => {
  const task = useAsync(...args)

  const extendedTask = Object.assign(task, {
    prepare,
    after: task.resultHook,
    error: task.errorHook,
  }) as typeof task & {
    prepare: typeof prepare
    after: typeof task.resultHook
    error: typeof task.errorHook
  }

  async function prepare(fn: AnyFn) {
    await fn()
    return task
  }

  return extendedTask
}

/**
 * wrapper a function with useAsync
 */
export const useAsyncify = <T extends AnyFn>(fn: T) => {
  return (...args: Parameters<T>) => {
    const task = useAsyncFlow(async () => {
      return await fn(...args)
    })
    return task
  }
}

/**
 * intended to make a closure,
 * @example useReceiver(item => open({ hi: check(item) }))
 */
export const useReceiver = <T extends AnyFn>(fn: T) => {
  return fn()
}
