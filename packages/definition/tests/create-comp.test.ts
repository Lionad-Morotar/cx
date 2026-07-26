import { describe, expect, it } from 'vitest'

import { createCxCompRuntime, cxNode, isCxComponent } from '../src/index'
import type { CxComponentRuntime } from '../src/index'

/**
 * createCxCompRuntime 表征测试：纯结构声明工厂的外部行为契约。
 *
 * 只锁外部可观察属性（字段填充、透传、守卫满足、别名），不锁内部实现。
 * 「无 as 强转 / 返回类型严格为 CxComponentRuntime」由定义侧 typecheck 兜底——
 * 末尾的显式类型标注赋值是一道类型层断言，编译通过即证明返回类型兼容。
 */
describe('createCxCompRuntime', () => {
  it('填充 id/key/name 与全部默认空字段', () => {
    const c = createCxCompRuntime('card-1', 'cx-card')

    expect(c.id).toBe('card-1')
    expect(c.key).toBe('cx-card')
    expect(c.name).toBe('card-1') // name 默认取 id（运行时昵称）
    expect(c.parents).toEqual([])
    expect(c.aliasKeys).toEqual([])
    expect(c.props).toEqual({})
    expect(c.emits).toEqual({})
    expect(c.exposes).toEqual({})
    expect(c.data).toEqual({})
    expect(c.components).toEqual({})
  })

  it('children 透传到 components（slot → 节点数组）', () => {
    const child = createCxCompRuntime('child', 'cx-text')
    const parent = createCxCompRuntime('parent', 'cx-block', { default: [child] })

    expect(parent.components).toEqual({ default: [child] })
  })

  it('data 透传并保留原始键值', () => {
    const c = createCxCompRuntime('id', 'cx-card', {}, { theme: 'dark', count: 3 })

    expect(c.data).toEqual({ theme: 'dark', count: 3 })
  })

  it('产物满足 isCxComponent 守卫', () => {
    const c = createCxCompRuntime('id', 'cx-card')

    expect(isCxComponent(c)).toBe(true)
  })

  it('cxNode 是 createCxCompRuntime 的别名（同一引用）', () => {
    expect(cxNode).toBe(createCxCompRuntime)
  })

  it('支持嵌套 children 构造多 slot 树', () => {
    const root = createCxCompRuntime('root', 'cx-page', {
      header: [createCxCompRuntime('header', 'cx-header')],
      main: [createCxCompRuntime('main', 'cx-main')],
    })

    expect(root.components!.header[0].id).toBe('header')
    expect(root.components!.main[0].id).toBe('main')
  })

  it('返回类型严格为 CxComponentRuntime（类型层断言，由 typecheck 裁决）', () => {
    const c: CxComponentRuntime = createCxCompRuntime('id', 'cx-card')

    expect(c.id).toBe('id')
  })
})
