import { describe, expect, it } from 'vitest'

import {
  CHUNK_MIN_CHARS,
  buildPageScenario,
  toStreamNode,
} from '../src/cx-scenario'
import type { CxStreamNodeSource } from '../src/cx-scenario'

/**
 * cx-scenario 行为契约：CxComponentRuntime（或结构兼容节点）→ 精简 CxStreamNode →
 * 带 ```json 围栏 pretty JSON → 行边界累积 chunks。
 * 语义与双消费方（playground stream-pages-scenario / 宿主 industry-chain-scenario）
 * 的 Fork 现状逐位一致——本套件即上提行为的特征测试（characterization test）。
 */

/** 递归收集子树所有节点（拍平 components 各插槽） */
function flatten(node: { components?: Record<string, unknown[]> }): unknown[] {
  const slots = node.components ?? {}
  return [
    node,
    ...Object.values(slots).flatMap((list) =>
      (list as { components?: Record<string, unknown[]> }[]).flatMap(flatten),
    ),
  ]
}

const fixture: CxStreamNodeSource[] = [
  {
    id: 'root',
    key: 'cx-block',
    // 运行时字段应被丢弃（name/props/emits/exposes/parents/aliasKeys 不进剧本）
    name: '舞台根',
    props: { some: 'prop' },
    emits: { change: {} },
    exposes: {},
    parents: ['p1'],
    aliasKeys: [],
    components: {
      default: [
        { id: 'bg', key: 'cx-video-background', data: { src: '/v.mp4' } },
        {
          id: 'grid',
          key: 'cx-grid',
          data: { colCount: 2 },
          components: {
            'row-1-col-1': [{ id: 'sec', key: 'cx-chain-section', data: {} }],
          },
        },
      ],
    },
  } as CxStreamNodeSource,
]

describe('toStreamNode', () => {
  it('丢弃运行时字段，省略空 data / 空 components', () => {
    const lite = toStreamNode({
      id: 'x',
      key: 'cx-text',
      name: '文本',
      aliasKeys: [],
      data: {},
      props: { some: 'prop' },
      emits: { change: {} },
      exposes: {},
      parents: ['p1'],
      components: {},
    } as CxStreamNodeSource)
    expect(lite).toEqual({ id: 'x', key: 'cx-text' })
  })

  it('保留非空 data，components 按 slot 名递归精简', () => {
    const lite = toStreamNode(fixture[0]!)
    expect(lite.id).toBe('root')
    expect(lite.key).toBe('cx-block')
    expect(lite.data).toBeUndefined()
    expect(Object.keys(lite.components!)).toEqual(['default'])
    const grid = lite.components!['default']![1]!
    expect(grid.key).toBe('cx-grid')
    expect(grid.data).toEqual({ colCount: 2 })
    // 空 data 的子节点同样省略
    expect(grid.components!['row-1-col-1']![0]!).toEqual({
      id: 'sec',
      key: 'cx-chain-section',
    })
  })
})

describe('buildPageScenario', () => {
  const scenario = buildPageScenario('demo', '演示', fixture)

  it('chunks 拼接与 script 逐位一致', () => {
    expect(scenario.chunks.join('')).toBe(scenario.script)
  })

  it('script 带 json 围栏', () => {
    expect(scenario.script.startsWith('```json\n')).toBe(true)
    expect(scenario.script.endsWith('\n```')).toBe(true)
  })

  it('行边界切分：非末块以换行结尾且不低于最小字符阈值', () => {
    const nonTail = scenario.chunks.slice(0, -1)
    expect(nonTail.length).toBeGreaterThan(0)
    for (const chunk of nonTail) {
      expect(chunk.endsWith('\n')).toBe(true)
      expect(chunk.length).toBeGreaterThanOrEqual(CHUNK_MIN_CHARS)
    }
  })

  it('rootKey 取首根物料 key', () => {
    expect(scenario.rootKey).toBe('cx-block')
  })

  it('确定性：同输入重跑产出逐位一致', () => {
    const again = buildPageScenario('demo', '演示', fixture)
    expect(again.script).toBe(scenario.script)
    expect(again.chunks).toEqual(scenario.chunks)
  })

  it('剧本 JSON 解析后与精简树同构且不含运行时字段', () => {
    const raw = scenario.script.slice('```json\n'.length, -'\n```'.length)
    const parsed = JSON.parse(raw)
    const all = (parsed as { components?: Record<string, unknown[]> }[]).flatMap(
      flatten,
    )
    expect(all.some((n) => (n as { key: string }).key === 'cx-grid')).toBe(true)
    expect(
      all.every(
        (n) =>
          !('props' in (n as object)) &&
          !('emits' in (n as object)) &&
          !('parents' in (n as object)),
      ),
    ).toBe(true)
  })
})
