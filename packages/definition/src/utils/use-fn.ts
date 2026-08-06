import middy from '@middy/core'
import type { AnyFn } from '@vueuse/core'
import { nanoid } from 'nanoid'
import { omit } from 'lodash-es'
import { effectScope } from 'vue'
import { tryOnScopeDispose } from '@vueuse/core'

/**
 * 钩子注册表：按包装函数名分桶的 pre/post/cancel/touch 列表。
 * 全局共享一份（useHooks），或经 genUseHooks() 创建作用域独立实例。
 */
export type HookRegistry = {
  pres: Map<string, AnyFn[]>
  posts: Map<string, AnyFn[]>
  cancels: Map<string, AnyFn[]>
  touches: Map<string, AnyFn[]>
}

const createRegistry = (): HookRegistry => ({
  pres: new Map(),
  posts: new Map(),
  cancels: new Map(),
  touches: new Map(),
})

const globalRegistry = createRegistry()

/**
 * 生成一个作用域内的包装函数，用于给函数注册前置、后置、取消和结果处理钩子，
 * 一般而言，直接使用全局的包装函数，即 useHooks 即可。
 *
 * 内核为 middy（async-first 中间件引擎），包装函数恒返回 Promise。
 * pre/post/cancel/touch 回调均可为 async，管线会逐个等待。
 */
export const genUseHooks =
  (hooks?: HookRegistry) =>
  <T extends AnyFn>(
    fn: T,
    /**
     * 提前绑定部分参数，但是会被后传入的覆盖
     */
    getPartialArgs?: (args?: Parameters<T>) => Partial<Parameters<T>[0]>,
  ) => {
    const name = `${fn.name || 'fn'}-${nanoid()}`
    const registry = hooks ?? createRegistry()

    const pre = (preFn: (x: { args: Parameters<T> }) => unknown) => {
      const list = registry.pres.get(name) ?? []
      registry.pres.set(name, [...list, preFn as AnyFn])
    }

    const post = <PostFn extends (x: { result: Awaited<ReturnType<T>>; args: Parameters<T> }) => unknown>(
      postFn: PostFn,
    ) => {
      const list = registry.posts.get(name) ?? []
      registry.posts.set(name, [...list, postFn as AnyFn])
    }

    // register an error handler, auto called when error occurs
    const cancel = <
      CancelFn extends (x: { result: Awaited<ReturnType<T>> | undefined; args: Parameters<T> }) => unknown,
    >(
      cancelFn: CancelFn,
    ) => {
      const list = registry.cancels.get(name) ?? []
      // 同一回调重复注册仅生效一次（编辑操作可能重复进入注册路径）
      if (!list.includes(cancelFn as AnyFn)) {
        registry.cancels.set(name, [...list, cancelFn as AnyFn])
      }
    }

    // touch function result then return new
    const touch = <
      Res extends Awaited<ReturnType<T>> = Awaited<ReturnType<T>>,
      TouchFn extends (x: Res) => Res = (x: Res) => Res,
    >(
      touchFn: TouchFn,
    ) => {
      const list = registry.touches.get(name) ?? []
      if (!list.includes(touchFn as AnyFn)) {
        registry.touches.set(name, [...list, touchFn as AnyFn])
      }
    }

    // 钩子回调在独立 effectScope 内执行：回调里注册的响应式副作用随回调结束销毁，
    // 不会泄漏到组件作用域；scope.run 的返回值必须回传，touch 的链式变换依赖它。
    // 已知折衷：async 回调在 await 之后注册的副作用会落在已停止的 scope 上（vue 仅警告），
    // 钩子回调的响应式操作应放在首个 await 之前的同步段
    const runInScope = <R>(run: () => R): R => {
      const scope = effectScope(true)
      try {
        return scope.run(run) as R
      } finally {
        scope.stop()
      }
    }

    // 仅在存在预绑定参数时合并，避免无预绑定时恒走 Object.assign 把原始类型首参装箱；
    // Object.assign 直接变异 args[0]（变异语义为既有契约，消费方依赖 opts 引用传递）
    const mergeArgs = (args: Parameters<T>): Parameters<T> => {
      if (!getPartialArgs) return args
      const partialArgs = getPartialArgs(args)
      const base = (args[0] || {}) as Record<string, unknown>
      const arg = Object.assign(base, omit(partialArgs, Object.keys(base)))
      return [arg, ...args.slice(1)] as unknown as Parameters<T>
    }

    const hooked = async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
      // 每次调用新建 middy 实例：相位标记 handlerEntered 与结果留存 lastResult 需按
      // 调用隔离（并发调用同一包装函数时共享状态会互相串扰），而 middy 实例创建只是
      // 数组装配，代价可忽略。补偿语义只对"fn 已开始执行"的失败生效——pre 阶段抛错
      // 时 fn 未执行，没有需要撤销的副作用，直接抛错不走 cancel。
      // lastResult 在 fn 成功时即捕获：middy 进入错误相位前会把 request.response
      // 重置为 undefined，onError 里直接读 response 会让补偿丢失 fn 的返回值
      let handlerEntered = false
      let lastResult: Awaited<ReturnType<T>> | undefined

      const instance = middy(async (event: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
        handlerEntered = true
        const result = (await fn(...event)) as Awaited<ReturnType<T>>
        lastResult = result
        return result
      }).use({
        before: async (request) => {
          request.event = mergeArgs(request.event)
          for (const preFn of registry.pres.get(name) ?? []) {
            await runInScope(() => preFn({ args: request.event }))
          }
        },
        // middy 多 after 中间件逆序执行，与契约的正序语义不符；
        // 故只用单个 after，在其内部按注册顺序串行执行 post 与 touch
        after: async (request) => {
          for (const postFn of registry.posts.get(name) ?? []) {
            await runInScope(() => postFn({ result: request.response, args: request.event }))
          }
          for (const touchFn of registry.touches.get(name) ?? []) {
            try {
              request.response = await runInScope(() => touchFn(request.response))
            } catch (e) {
              // touch 容错：单个失败不中断管线，跳过后续 touch，保留已变换结果
              console.error('[error] error on touch hook', e)
              break
            }
          }
        },
        onError: async (request) => {
          if (!handlerEntered) return
          for (const cancelFn of registry.cancels.get(name) ?? []) {
            try {
              await runInScope(() => cancelFn({ result: lastResult, args: request.event }))
            } catch (e) {
              // cancel 容错：补偿回调自身失败时跳过后续，原始错误继续传播
              console.error('[error] error on cancel hook', e)
              break
            }
          }
          // 不向 onError 返回值：middy 会继续把 request.error 抛给调用方
        },
      })

      return (await instance(args, {})) as Awaited<ReturnType<T>>
    }

    const hookedFn = hooked as typeof hooked & {
      hooks?: HookRegistry
      pre?: typeof pre
      post?: typeof post
      cancel?: typeof cancel
      touch?: typeof touch
    }
    hookedFn.hooks = registry
    hookedFn.pre = pre
    hookedFn.post = post
    hookedFn.cancel = cancel
    hookedFn.touch = touch

    tryOnScopeDispose(() => {
      // dispose 按 name 精确清理注册表（含全局共享实例）：组件卸载后残留的钩子
      // 会在下次同名函数调用时触发已失效闭包，必须随作用域一同销毁
      ;(['hooks', 'pre', 'post', 'cancel', 'touch'] as const).forEach((k) => {
        delete hookedFn[k]
      })
      registry.pres.delete(name)
      registry.posts.delete(name)
      registry.cancels.delete(name)
      registry.touches.delete(name)
    })

    return hookedFn as ((...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>>) & {
      hooks: HookRegistry
      pre: typeof pre
      post: typeof post
      cancel: typeof cancel
      touch: typeof touch
    }
  }

/**
 * better hooks with error and result handling
 * !1. 包装函数恒返回 Promise，调用方需要 await 或显式 fire-and-forget
 * !2. 依赖函数名称，所以使用时需要注意保证函数名称的唯一性，
 * !   或者请使用 genUseHooks 生成作用域内独一无二的 useHooks
 * @see https://github.com/middyjs/middy
 */
export const useHooks = genUseHooks(globalRegistry)

export type UseHooks = typeof useHooks
