import kareem from 'kareem'
import type { AnyFn } from '@vueuse/core'
import { nanoid } from 'nanoid'
import { omit } from 'lodash-es'
import { effectScope } from 'vue'
import { tryOnScopeDispose } from '@vueuse/core'

const globalHooks = new kareem() as InstanceType<typeof kareem> & {
  // _pres is kareem implementation, but not typed, so we override it
  _pres: Map<string, { isAsync: boolean; fn: AnyFn }[]>
  // _posts is kareem implementation, but not typed, so we override it
  _posts: Map<string, { isAsync: boolean; fn: AnyFn }[]>
  // _cancels is custom implementation, for better error handling
  _cancels: Map<string, { fn: AnyFn }[]>
  // _touches is custom implementation, for better result handling
  _touches: Map<string, { fn: AnyFn }[]>
}
globalHooks._cancels = new Map()
globalHooks._touches = new Map()

/**
 * 生成一个作用域内的包装函数，包装函数是 Kareem 的增强版本，
 * 用于给函数注册前置、后置、取消和结果处理钩子，
 * 一般而言，直接使用全局的包装函数，即 useHooks 即可。
 */
export const genUseHooks =
  (hooks?: typeof globalHooks) =>
  <T extends AnyFn>(
    fn: T,
    /**
     * 提前绑定部分参数，但是会被后传入的覆盖
     */
    getPartialArgs?: (args?: Parameters<T>) => Partial<Parameters<T>[0]>,
  ) => {
    const name = `${fn.name || 'fn'}-${nanoid()}`

    let hooksInstance = hooks

    if (!hooksInstance) {
      hooksInstance = new kareem() as InstanceType<typeof kareem> & {
        // _pres is kareem implementation, but not typed, so we override it
        _pres: Map<string, { isAsync: boolean; fn: AnyFn }[]>
        // _posts is kareem implementation, but not typed, so we override it
        _posts: Map<string, { isAsync: boolean; fn: AnyFn }[]>
        // _cancels is custom implementation, for better error handling
        _cancels: Map<string, { fn: AnyFn }[]>
        // _touches is custom implementation, for better result handling
        _touches: Map<string, { fn: AnyFn }[]>
      }
      hooksInstance._cancels = new Map()
      hooksInstance._touches = new Map()
    }

    // console.log('[debug] hooks', hooks)

    const pre = (fn: AnyFn) => {
      // kareem pre 回调的参数由其运行时反射注入（next 回调、原始 args 等），
      // 形态不在静态类型边界内；用 unknown[] 收紧，透传时断言对齐 fn 签名
      hooksInstance.pre(name, (...args: unknown[]) => {
        const scope = effectScope(true)
        try {
          scope.run(() => (fn as AnyFn)(...args))
        } finally {
          scope.stop()
        }
      })
    }

    const post = <PostFn extends (x: { result: ReturnType<T>; args: Parameters<T> }) => void>(
      fn: PostFn,
    ) => {
      hooksInstance.post(name, (...args: unknown[]) => {
        const scope = effectScope(true)
        try {
          // kareem post 回调把 { result, args } 包裹后注入，args 为 unknown[]；
          // 断言为 PostFn 期望的入参形态（运行时由 execPost 的 [{result,args}] 保证）
          scope.run(() => (fn as AnyFn)(...args))
        } finally {
          scope.stop()
        }
      })
    }
    // register an error handler, auto called when error occurs
    const cancel = <CancelFn extends (x: { result: ReturnType<T>; args: Parameters<T> }) => void>(
      fn: CancelFn,
    ) => {
      type CancelCtx = { result: ReturnType<T>; args: Parameters<T> }
      // 包装函数挂 .fn 引用原始 fn，供去重比较；类型用带可选 fn 的函数描述
      const newFn = ((x: CancelCtx) => {
        const scope = effectScope(true)
        try {
          scope.run(() => fn(x))
        } finally {
          scope.stop()
        }
      }) as ((x: CancelCtx) => void) & { fn?: CancelFn }
      newFn.fn = fn

      let cancels = hooksInstance._cancels.get(name)
      if (!cancels) {
        cancels = []
        hooksInstance._cancels.set(name, cancels)
      }

      const idx = cancels.findIndex((pre: { fn: AnyFn }) => {
        // newFn 挂了 .fn 引用原始 fn 用于去重；AnyFn 上无 .fn 静态属性，断言取出
        const wrapped = pre.fn as AnyFn & { fn?: CancelFn }
        return wrapped.fn === fn
      })
      if (idx === -1) {
        cancels.push({ fn: newFn })
      }
    }

    // touch function result then return new
    const touch = <
      Res extends ReturnType<T> = ReturnType<T>,
      TouchFn extends (x: Res) => Res = (x: Res) => Res,
    >(
      fn: TouchFn,
    ) => {
      const newFn = ((x: Res) => {
        const scope = effectScope(true)
        try {
          scope.run(() => fn(x))
        } finally {
          scope.stop()
        }
      }) as ((x: Res) => void) & { fn?: TouchFn }
      newFn.fn = fn

      let touches = hooksInstance._touches.get(name)
      if (!touches) {
        touches = []
        hooksInstance._touches.set(name, touches)
      }

      const idx = touches.findIndex((pre: { fn: AnyFn }) => {
        const wrapped = pre.fn as AnyFn & { fn?: TouchFn }
        return wrapped.fn === fn
      })
      if (idx === -1) {
        touches.push({ fn: newFn })
      }
    }

    const fnName = (fn.name || nanoid()) as unknown as 'fn-name'
    const newFnCtx = {
      [fnName]: function (...args: Parameters<T>) {
        const partialArgs = getPartialArgs ? getPartialArgs(args) : {}
        // args[0] 在泛型 Parameters<T> 下可能是可选/联合，用对象断言对齐 Object.assign 目标；
        // omit(partialArgs, keys) 移除调用方已显式传入的键，保留预绑定独有部分
        const base = (args[0] || {}) as Record<string, unknown>
        const arg = Object.assign(base, omit(partialArgs, Object.keys(base)))
        const newArgs = [arg, ...args.slice(1)] as unknown as Parameters<T>

        // console.log('[info] calling hooks', name, args)
        let error: unknown | null = null
        hooksInstance.execPre(name, null, args as unknown[], (e: unknown) => {
          if (error == null && e != null) error = e
        })
        // 当 pre hook 有错误时，直接抛出，不需要执行取消函数
        if (error) {
          throw error
        }

        let result: ReturnType<T> | undefined
        const scope = effectScope(true)
        try {
          // newArgs 首项是 args[0] 与 partialArgs 合并结果，泛型元组无法静态证明
          // 与 Parameters<T> 完全同构，运行时由 Object.assign 保证形状
          scope.run(() => {
            result = fn(...newArgs)
          })
        } catch (e) {
          error = e
        } finally {
          scope.stop()
        }

        const execCancels = ({
          result,
          args,
        }: {
          result: ReturnType<T> | undefined
          args: unknown[]
        }) => {
          const cancels = hooksInstance._cancels.get(name) || []
          const hasCancel = cancels.length > 0
          if (!hasCancel) {
            console.log('[info] error on post hook, and no need to cancel')
          } else {
            try {
              cancels.forEach(({ fn }: { fn: AnyFn }) =>
                fn({
                  result,
                  args,
                }),
              )
              console.log('[info] error on post hook, and canceled')
            } catch (e) {
              console.error('[error] error on post hook, and failed to cancel', e)
            }
          }
        }

        if (error) {
          execCancels({
            result,
            args: newArgs,
          })
          throw error
        }

        hooksInstance.execPost(
          name,
          null,
          // kareem execPost 第三参数为 args:any[]，这里把 {result,args} 上下文
          // 作为单一元素注入，供 post 回调接收；第四参数位 kareem 设计为 options，
          // 此处复用为 result 透传通道（库的反射式用法，无法静态对齐类型签名）
          [{ result, args }] as unknown[],
          [result] as unknown as Record<string, unknown>,
          (error: unknown) => {
            if (error) {
              execCancels({
                result,
                args,
              })
              throw error
            }
          },
        )

        const touches = hooksInstance._touches.get(name) || []
        let newResult = result
        try {
          touches.forEach(({ fn }: { fn: AnyFn }) => {
            newResult = fn(newResult)
          })
        } catch (e) {
          console.error('[error] error on touch hook', e)
        }

        return newResult
      },
    } as const
    // 包装函数需要挂载钩子注册方法（pre/post/cancel/touch）和 hooks 实例引用；
    // 计算属性键 [fnName] 下的对象类型推断退化为纯函数，无法承载这些属性，
    // 用 HookedFn 断言挂载点，避免 any 逃逸到消费侧
    type HookedFn = ((...args: Parameters<T>) => ReturnType<T>) & {
      hooks?: typeof hooksInstance
      pre?: typeof pre
      post?: typeof post
      cancel?: typeof cancel
      touch?: typeof touch
    }
    const hooked = newFnCtx[fnName] as HookedFn
    hooked.hooks = hooksInstance
    hooked.pre = pre
    hooked.post = post
    hooked.cancel = cancel
    hooked.touch = touch

    tryOnScopeDispose(() => {
      // console.log('[info] clear hooks', name)
      ;(['hooks', 'pre', 'post', 'cancel', 'touch'] as const).forEach((k) => {
        delete hooked[k]
      })
      delete (newFnCtx as Record<string, unknown>)[fnName]
      if (hooksInstance !== globalHooks) {
        hooksInstance._pres.clear()
        hooksInstance._posts.clear()
        hooksInstance._cancels.clear()
        hooksInstance._touches.clear()
      }
    })

    return newFnCtx[fnName] as T & {
      hooks: typeof hooksInstance
      pre: typeof pre
      post: typeof post
      cancel: typeof cancel
      touch: typeof touch
    }
  }

/**
 * better kareem with error and result handling
 * !1. 因为 Kareem 内部依赖 nextTick 保证执行顺序，所以需要大量异步执行的函数禁止使用 useHooks 包装
 * !2. 依赖函数名称，所以使用时需要注意保证函数名称的唯一性，
 * !   或者请使用 genUseHooks 生成作用域内独一无二的 useHooks
 * @see https://www.npmjs.com/package/kareem
 */
export const useHooks = genUseHooks(globalHooks)

export type UseHooks = typeof useHooks
