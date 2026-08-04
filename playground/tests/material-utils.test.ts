import { describe, expect, it } from 'vitest'

import {
  buildDefaultData,
  buildSampleNode,
  toItem,
  toRenderNode,
  type CxMeta,
} from '../app/dev/material-utils'

// material-utils 节点构造契约：buildSampleNode 是 toItem 的泛化（支持 data 覆盖与自定义 id），
// variants 机制与旧 dev 页共享同一构造路径，行为不得分叉。

const textMeta: CxMeta = {
  key: 'cx-fake-text',
  name: '假文本',
  props: {
    content: { name: '内容', type: 'short', initial: '' },
    level: { name: '级别', type: 'select', initial: 2 },
  },
}

const containerMeta: CxMeta = {
  key: 'cx-fake-card',
  name: '假卡片',
  props: { title: { name: '标题', type: 'short', initial: '默认标题' } },
  slots: { default: { key: 'default', name: '主体' }, header: { key: 'header', name: '头部' } },
}

describe('buildSampleNode', () => {
  it('缺省构造与 toItem 的节点同构（id / data / 字段齐备）', () => {
    const node = buildSampleNode(textMeta)
    expect(node.id).toBe('dev-cx-fake-text')
    expect(node.key).toBe(textMeta.key)
    expect(node.data).toEqual(buildDefaultData(textMeta))
    expect(toItem({ _cx_meta: textMeta }).node).toEqual(node)
  })

  it('default slot 物料注入示例文本子节点（toItem 行为保留）', () => {
    const node = buildSampleNode(containerMeta)
    const comps = node.components as Record<string, { key: string }[]>
    expect(comps.default).toHaveLength(1)
    expect(comps.default[0]!.key).toBe('cx-text')
    expect('header' in comps).toBe(false)
  })

  it('dataOverride 浅合并：覆盖键生效、其余键保留', () => {
    const node = buildSampleNode(textMeta, { dataOverride: { content: '覆盖文本' } })
    expect(node.data).toEqual({ content: '覆盖文本', level: 2 })
  })

  it('自定义 id 受尊重（variant 块唯一实例标识）', () => {
    const node = buildSampleNode(textMeta, { id: 'dev-cx-fake-text-v1' })
    expect(node.id).toBe('dev-cx-fake-text-v1')
  })

  it('覆盖与缺省节点互不共享 data 引用', () => {
    const a = buildSampleNode(textMeta)
    const b = buildSampleNode(textMeta, { dataOverride: { level: 5 } })
    ;(b.data as Record<string, unknown>).level = 99
    expect((a.data as Record<string, unknown>).level).toBe(2)
  })
})

describe('toRenderNode', () => {
  // 页面级流式验收（/dev/stream/pages）依赖嵌套树递归转换；
  // 组件级验收（/dev/stream/components）消费单节点，行为须逐位保持。

  it('无 components 单节点输出与既有形状逐位一致', () => {
    const node = toRenderNode({ id: 'a', key: 'cx-demo', data: { x: 1 } })
    expect(node).toEqual({
      id: 'a',
      key: 'cx-demo',
      name: 'cx-demo',
      data: { x: 1 },
      props: {},
      emits: {},
      exposes: {},
      parents: [],
      components: {},
    })
  })

  it('id/name 缺省回退与既有行为一致', () => {
    const node = toRenderNode({ key: 'cx-demo' })
    expect(node.id).toBe('stream-node')
    expect(node.name).toBe('cx-demo')
  })

  it('嵌套 components 按 slot 名分组递归保留', () => {
    const node = toRenderNode({
      id: 'root',
      key: 'cx-page-main',
      components: {
        default: [
          {
            id: 'layout',
            key: 'cx-layout',
            components: {
              header: [{ id: 'bar', key: 'cx-header-bar', data: { live: true } }],
            },
          },
        ],
      },
    })
    const layout = node.components['default']?.[0]
    expect(layout?.key).toBe('cx-layout')
    const bar = layout?.components['header']?.[0]
    expect(bar?.key).toBe('cx-header-bar')
    expect(bar?.data).toEqual({ live: true })
    // 每层均为 CxComponentRuntime 形状（运行时字段齐备）
    for (const n of [node, layout, bar]) {
      expect(n).toMatchObject({ props: {}, emits: {}, exposes: {}, parents: [] })
    }
  })

  it('数组形式 components 归入 default slot', () => {
    const node = toRenderNode({
      id: 'root',
      key: 'cx-page-main',
      components: [{ id: 'child', key: 'cx-text' }],
    })
    expect(node.components['default']?.[0]?.key).toBe('cx-text')
  })
})
