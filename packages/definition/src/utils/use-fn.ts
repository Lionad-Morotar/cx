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
      hooksInstance.pre(name, (...args: any[]) => {
        const scope = effectScope(true)
        try {
          scope.run(() => fn(...args))
        } finally {
          scope.stop()
        }
      })
    }

    const post = <PostFn extends (x: { result: ReturnType<T>; args: Parameters<T> }) => void>(
      fn: PostFn,
    ) => {
      hooksInstance.post(name, (...args: any[]) => {
        const scope = effectScope(true)
        try {
          // @ts-ignore
          scope.run(() => fn(...args))
        } finally {
          scope.stop()
        }
      })
    }
    // register an error handler, auto called when error occurs
    const cancel = <CancelFn extends (x: { result: ReturnType<T>; args: Parameters<T> }) => void>(
      fn: CancelFn,
    ) => {
      const newFn = (x: any) => {
        const scope = effectScope(true)
        try {
          // @ts-ignore
          scope.run(() => fn(x))
        } finally {
          scope.stop()
        }
      }
      newFn.fn = fn

      let cancels = hooksInstance._cancels.get(name)
      if (!cancels) {
        cancels = []
        hooksInstance._cancels.set(name, cancels)
      }

      const idx = cancels.findIndex((pre: { fn: AnyFn }) => (pre.fn as any)?.fn === fn)
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
      const newFn = (x: any) => {
        const scope = effectScope(true)
        try {
          // @ts-ignore
          scope.run(() => fn(x))
        } finally {
          scope.stop()
        }
      }
      newFn.fn = fn

      let touches = hooksInstance._touches.get(name)
      if (!touches) {
        touches = []
        hooksInstance._touches.set(name, touches)
      }

      const idx = touches.findIndex((pre: { fn: AnyFn }) => (pre.fn as any)?.fn === fn)
      if (idx === -1) {
        touches.push({ fn: newFn })
      }
    }

    const fnName = (fn.name || nanoid()) as unknown as 'fn-name'
    const newFnCtx = {
      [fnName]: function (...args: Parameters<T>) {
        const partialArgs = getPartialArgs ? getPartialArgs(args) : {}
        // @ts-ignore
        const arg = Object.assign(args[0] || {}, omit(partialArgs, Object.keys(args[0] || {})))
        const newArgs = [arg, ...args.slice(1)]

        // console.log('[info] calling hooks', name, args)
        let error: unknown | null = null
        hooksInstance.execPre(name, null, args as any, (e: unknown) => {
          if (error == null && e != null) error = e
        })
        // 当 pre hook 有错误时，直接抛出，不需要执行取消函数
        if (error) {
          throw error
        }

        let result: ReturnType<T> | undefined
        const scope = effectScope(true)
        try {
          // @ts-ignore
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
          [{ result, args }] as any,
          [result],
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
    ;(newFnCtx[fnName] as any).hooks = hooksInstance
    ;(newFnCtx[fnName] as any).pre = pre
    ;(newFnCtx[fnName] as any).post = post
    ;(newFnCtx[fnName] as any).cancel = cancel
    ;(newFnCtx[fnName] as any).touch = touch

    tryOnScopeDispose(() => {
      // console.log('[info] clear hooks', name)
      ;['hooks', 'pre', 'post', 'cancel', 'touch'].forEach((k) => {
        // @ts-ignore
        delete newFnCtx[fnName][k]
      })
      // @ts-ignore
      delete newFnCtx[fnName]
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
