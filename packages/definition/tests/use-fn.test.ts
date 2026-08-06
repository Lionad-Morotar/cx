import { afterEach, describe, expect, it, vi } from 'vitest'
import { effectScope } from 'vue'

import { genUseHooks } from '../src/index'

/**
 * use-fn 契约测试：genUseHooks 包装后的公开行为规格（钩子顺序、错误传播、返回值）。
 * 断言不依赖内核实现（kareem / middy 均可），内核更换时本文件即迁移验收网。
 *
 * 异步契约：包装函数恒返回 Promise；pre/post/cancel/touch 回调可为 async，管线会等待。
 * 相比 kareem 时代的有意识变更：
 * - 包装函数同步返回 → 异步返回 Promise
 * - 被包装 async 函数时 post 收到未解析的 Promise → 收到 await 后的结果
 * - pre 回调无参 → 接收 { args } 调用参数上下文（与 post/cancel 对称）
 * - touch 链式变换此前因实现缺陷失效 → 修复为正常链式
 * - 无预绑定参数时首参原样传递（此前恒走 Object.assign 导致原始类型被装箱）
 * - post 与 cancel 注入同一形态 args（此前 post 注入原始 args、cancel 注入合并后 args）
 */

// console spy 统一在 afterEach 恢复，避免单用例断言失败时 mock 泄漏到后续用例
afterEach(() => {
  vi.restoreAllMocks()
})

describe('genUseHooks 契约', () => {
  it('pre 按注册顺序依次执行', async () => {
    const calls: string[] = []
    const useHooks = genUseHooks()
    const fn = useHooks((x: number) => x + 1)

    fn.pre(() => calls.push('pre-1'))
    fn.pre(() => calls.push('pre-2'))
    await fn(1)

    expect(calls).toEqual(['pre-1', 'pre-2'])
  })

  it('pre 接收 { args } 调用参数上下文', async () => {
    const useHooks = genUseHooks()
    const fn = useHooks((x: number, y: number) => x + y)

    let seen: { args: [number, number] } | null = null
    fn.pre((x) => {
      seen = x
    })
    await fn(1, 2)

    expect(seen).toEqual({ args: [1, 2] })
  })

  it('pre 抛错：错误直接抛出，fn 与 cancel 均未执行', async () => {
    const useHooks = genUseHooks()
    const body = vi.fn((x: number) => x + 1)
    const cancelFn = vi.fn()
    const fn = useHooks(body)

    fn.pre(() => {
      throw new Error('pre-failed')
    })
    fn.cancel(cancelFn)

    await expect(fn(1)).rejects.toThrow('pre-failed')
    expect(body).not.toHaveBeenCalled()
    expect(cancelFn).not.toHaveBeenCalled()
  })

  it('async pre 抛错同样阻断执行', async () => {
    const useHooks = genUseHooks()
    const body = vi.fn((x: number) => x + 1)
    const fn = useHooks(body)

    fn.pre(async () => {
      throw new Error('async-pre-failed')
    })

    await expect(fn(1)).rejects.toThrow('async-pre-failed')
    expect(body).not.toHaveBeenCalled()
  })

  it('post 接收 { result, args }：result 为 fn 返回值，args 为调用参数数组', async () => {
    const useHooks = genUseHooks()
    const fn = useHooks((x: number) => x * 2)

    let seen: { result: number; args: [number] } | null = null
    fn.post((x) => {
      seen = x
    })
    await fn(21)

    expect(seen).toEqual({ result: 42, args: [21] })
  })

  it('多个 post 按注册顺序执行', async () => {
    const calls: string[] = []
    const useHooks = genUseHooks()
    const fn = useHooks((x: number) => x + 1)

    fn.post(() => calls.push('post-1'))
    fn.post(() => calls.push('post-2'))
    await fn(1)

    expect(calls).toEqual(['post-1', 'post-2'])
  })

  it('被包装 async 函数：返回值与 post 均收到 await 后的结果', async () => {
    const useHooks = genUseHooks()
    const fn = useHooks(async (x: number) => x * 2)

    let seen: { result: number; args: [number] } | null = null
    fn.post((x) => {
      seen = x
    })

    const result = await fn(21)
    expect(result).toBe(42)
    expect(seen).toEqual({ result: 42, args: [21] })
  })

  it('fn 抛错：cancel 收到 { result: undefined, args }，原错误抛给调用方', async () => {
    const useHooks = genUseHooks()
    const fn = useHooks((_opts: { x: number }): number => {
      throw new Error('body-failed')
    })

    let seen: { result: number | undefined; args: [{ x: number }] } | null = null
    fn.cancel((x) => {
      seen = x
    })

    await expect(fn({ x: 7 })).rejects.toThrow('body-failed')
    expect(seen).toEqual({ result: undefined, args: [{ x: 7 }] })
  })

  it('async fn reject：cancel 被调用，错误抛给调用方', async () => {
    const useHooks = genUseHooks()
    const fn = useHooks(async (_opts: { x: number }): Promise<number> => {
      throw new Error('async-body-failed')
    })
    const cancelFn = vi.fn()

    fn.cancel(cancelFn)

    await expect(fn({ x: 1 })).rejects.toThrow('async-body-failed')
    expect(cancelFn).toHaveBeenCalledTimes(1)
  })

  it('post 抛错：cancel 被调用，错误传播给调用方', async () => {
    const useHooks = genUseHooks()
    const fn = useHooks((x: number) => x + 1)
    const cancelFn = vi.fn()

    fn.post(() => {
      throw new Error('post-failed')
    })
    fn.cancel(cancelFn)

    await expect(fn(1)).rejects.toThrow('post-failed')
    expect(cancelFn).toHaveBeenCalledTimes(1)
  })

  it('fn 成功但 post 抛错：cancel 收到 fn 的返回值（补偿撤销依据）', async () => {
    // 补偿回调靠 result 判断"已执行到哪一步"以决定撤销动作（如 addComponent 失败后
    // 撤销已添加的组件）；middy 进入错误相位时会重置 response，实现须在闭包留存
    const useHooks = genUseHooks()
    const fn = useHooks((x: number) => x * 2)

    let seen: { result: number | undefined; args: [number] } | null = null
    fn.post(() => {
      throw new Error('post-failed')
    })
    fn.cancel((x) => {
      seen = x
    })

    await expect(fn(21)).rejects.toThrow('post-failed')
    expect(seen).toEqual({ result: 42, args: [21] })
  })

  it('cancel 同一 fn 重复注册仅执行一次（去重）', async () => {
    const useHooks = genUseHooks()
    const fn = useHooks((_x: number): number => {
      throw new Error('boom')
    })
    const cancelFn = vi.fn()

    fn.cancel(cancelFn)
    fn.cancel(cancelFn)

    await expect(fn(1)).rejects.toThrow('boom')
    expect(cancelFn).toHaveBeenCalledTimes(1)
  })

  it('cancel 回调抛错：后续 cancel 跳过，原错误仍抛给调用方', async () => {
    const useHooks = genUseHooks()
    const fn = useHooks((_x: number): number => {
      throw new Error('origin')
    })
    const second = vi.fn()

    fn.cancel(() => {
      throw new Error('cancel-failed')
    })
    fn.cancel(second)

    await expect(fn(1)).rejects.toThrow('origin')
    expect(second).not.toHaveBeenCalled()
  })

  it('touch 按注册顺序链式变换返回值', async () => {
    const useHooks = genUseHooks()
    const fn = useHooks((x: number) => x + 1)

    fn.touch((x: number) => x * 10)
    fn.touch((x: number) => x + 100)

    expect(await fn(1)).toBe(120)
  })

  it('touch 抛错静默：console.error 记录，剩余 touch 跳过，返回已变换的最后有效结果', async () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const useHooks = genUseHooks()
    const fn = useHooks((x: number) => x + 1)
    const third = vi.fn((x: number) => x + 1000)

    fn.touch((x: number) => x * 10)
    fn.touch(() => {
      throw new Error('touch-failed')
    })
    fn.touch(third)

    expect(await fn(1)).toBe(20)
    expect(third).not.toHaveBeenCalled()
    expect(errSpy).toHaveBeenCalled()
  })

  it('getPartialArgs 预绑定：显式传参覆盖预绑定键，未覆盖键保留', async () => {
    const useHooks = genUseHooks()
    const fn = useHooks(
      (opts: { a: number; b: number }) => ({ ...opts }),
      () => ({ a: 1, b: 1 }),
    )

    expect(await fn({ a: 99 } as { a: number; b: number })).toEqual({ a: 99, b: 1 })
  })

  it('getPartialArgs 合并直接变异调用方传入的首个参数对象（变异语义保持）', async () => {
    const useHooks = genUseHooks()
    const fn = useHooks((opts: { a?: number; b?: number }) => ({ ...opts }), () => ({ b: 2 }))

    const input: { a?: number; b?: number } = { a: 1 }
    await fn(input)

    expect(input.b).toBe(2)
  })

  it('无预绑定参数时首参原样传递，post 与 cancel 注入同一形态 args', async () => {
    const useHooks = genUseHooks()
    const fn = useHooks((x: number) => x + 1)

    let postSeen: { result: number; args: unknown[] } | null = null
    fn.post((x) => {
      postSeen = x
    })
    await fn(7)
    expect(postSeen!.args[0]).toBe(7)

    const fn2 = useHooks((_x: number): number => {
      throw new Error('boom')
    })
    let cancelSeen: { result: number | undefined; args: unknown[] } | null = null
    fn2.cancel((x) => {
      cancelSeen = x
    })
    await expect(fn2(7)).rejects.toThrow('boom')
    expect(cancelSeen!.args[0]).toBe(7)
  })

  it('post 回调内改写 result 不影响包装函数返回值', async () => {
    const useHooks = genUseHooks()
    const fn = useHooks((x: number) => x + 1)

    fn.post((x) => {
      x.result = 999
    })

    expect(await fn(1)).toBe(2)
  })

  it('effectScope dispose 后包装函数的钩子挂载方法被移除', async () => {
    const scope = effectScope()
    let fn!: ReturnType<ReturnType<typeof genUseHooks>>

    scope.run(() => {
      const useHooks = genUseHooks()
      fn = useHooks((x: number) => x + 1)
    })

    expect(typeof fn.pre).toBe('function')
    scope.stop()
    expect(typeof fn.pre).toBe('undefined')
    expect(typeof fn.post).toBe('undefined')
    expect(typeof fn.cancel).toBe('undefined')
    expect(typeof fn.touch).toBe('undefined')
    expect(typeof fn.hooks).toBe('undefined')
  })

  it('作用域实例间隔离：实例 A dispose 不影响实例 B 的钩子执行', async () => {
    const scopeA = effectScope()
    const calls: string[] = []
    let fnA!: ReturnType<ReturnType<typeof genUseHooks>>

    scopeA.run(() => {
      const useHooksA = genUseHooks()
      fnA = useHooksA((x: number) => x + 1)
      fnA.pre(() => calls.push('A-pre'))
    })

    const useHooksB = genUseHooks()
    const fnB = useHooksB((x: number) => x + 1)
    fnB.pre(() => calls.push('B-pre'))

    scopeA.stop()
    await fnB(1)

    expect(calls).toEqual(['B-pre'])
  })
})
