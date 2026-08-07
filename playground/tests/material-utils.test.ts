import { describe, expect, it } from 'vitest'

import { buildDefaultData, buildSampleNode, toItem, type CxMeta } from '../app/dev/material-utils'

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
