import { nextTick, reactive } from 'vue'

import type { UnwrapRef } from 'vue'

type ResultHook<Result> = (arg: UnwrapRef<Result>) => unknown
type ErrorHook = (err: Error) => unknown

/**
 * 获取异步函数的结果以及 loading、error 等执行状态
 *
 * 轻量异步状态封装（78 行本地副本），
 * 站会链路全部调用现场只用 exec/result/isLoading/resultHook/errorHook，
 * 本副本已覆盖；更丰富的变体（isEmpty/并发检查等）在本链路无人使用。
 */
export function useAsync<Result, Args extends unknown[]>(
  bindFuncOrPromise: Promise<Result> | ((...args: Args) => Promise<Result>),
) {
  const isPromise = bindFuncOrPromise instanceof Promise

  const states = reactive({
    isLoading: false,
    isError: false,
    // 函数执行结果
    result: null as Result | null,
    // 主动触发函数执行
    exec,
    // 注册结果监听函数
    resultHook,
    // 注册出错监听函数
    errorHook,
  })

  const _resultHookCB = [] as ResultHook<Result>[]
  const _errorHookCB = [] as ErrorHook[]

  function resultHook(cb: ResultHook<Result>) {
    _resultHookCB.push(cb)
    return states
  }
  async function execResultHook(res: UnwrapRef<Result>) {
    for await (const cb of _resultHookCB) {
      await cb(res)
    }
  }
  function errorHook(cb: ErrorHook) {
    _errorHookCB.push(cb)
    return states
  }
  async function execErrorHook(err: Error) {
    for await (const cb of _errorHookCB) {
      await cb(err)
    }
  }

  // 在下一个 Tick 执行注册的函数
  async function exec(...args: Args) {
    states.isLoading = true
    try {
      // 确保同一个宏任务中 useAsync().exec() 以及注册的钩子函数如 useAsync().resultHook() 的调用顺序，
      // 先执 useAsync().resultHook() 再执行 useAsync().exec()
      await nextTick()

      const handler =
        bindFuncOrPromise instanceof Function ? bindFuncOrPromise(...args) : bindFuncOrPromise
      const res = await handler
      states.result = res as UnwrapRef<Result>
      execResultHook(states.result)
    } catch (err) {
      console.log('[ERR] err in useAsync', err)
      states.isError = true
      execErrorHook(err as Error)
    } finally {
      states.isLoading = false
    }
    return states.result
  }

  const fakeArgs = [] as unknown as Args
  isPromise && exec(...fakeArgs)

  return states
}
