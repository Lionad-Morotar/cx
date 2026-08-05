// 嵌套演示剧本（stream-nested-scenario）的无头契约：带 trigger 声明的物料
// 嵌套树 → 流式剧本 → 树级增量出帧 的全链路行为断言。
// 与 stream-pages-scenario（standup 静态骨架，纯 prune 语义）并列，
// 锁定「组件级语义进页面树」：array 逐行、region 分区揭示、scalar 骨架标记。
import { describe, expect, it } from 'vitest'
import {
  createIncrementalExtractor,
  createSpecDetector,
  cxSpecDetectorConfig,
  matchCxTrigger,
  type CxSpec,
  type CxStreamNode,
} from '@lionad/cx-stream'

import { NESTED_SCENARIOS } from '~/dev/stream-nested-scenario'
import { createPageTriggerRegistry } from '~/dev/stream-pages-scenario'

const scenario = NESTED_SCENARIOS[0]!

function createNestedExtractor() {
  return createIncrementalExtractor<CxSpec>({
    registry: createPageTriggerRegistry(),
    matchTrigger: matchCxTrigger,
  })
}

/** 收集节点树全部对象节点（不过滤 key——半节点正是要暴露的对象） */
function collectAllNodes(
  node: unknown,
  out: { id?: string; key?: string }[] = [],
): { id?: string; key?: string }[] {
  if (Array.isArray(node)) {
    for (const n of node) collectAllNodes(n, out)
    return out
  }
  if (node && typeof node === 'object') {
    const n = node as { id?: string; key?: string; components?: unknown }
    out.push({ id: n.id, key: n.key })
    if (n.components && typeof n.components === 'object') {
      for (const v of Object.values(n.components)) collectAllNodes(v, out)
    }
  }
  return out
}

/** 收集节点树 id:key 序列（文档序、深度优先），用于前缀子集断言 */
function collectKeys(node: unknown): string[] {
  return collectAllNodes(node).map((n) => `${n.id}:${n.key}`)
}

/** 按 key 深度优先查找首个命中节点（剧本内 key 唯一） */
function findByKey(node: unknown, key: string): CxStreamNode | null {
  if (Array.isArray(node)) {
    for (const n of node) {
      const hit = findByKey(n, key)
      if (hit) return hit
    }
    return null
  }
  if (node && typeof node === 'object') {
    const n = node as CxStreamNode
    if (n.key === key) return n
    if (n.components && typeof n.components === 'object') {
      for (const v of Object.values(n.components)) {
        const hit = findByKey(v, key)
        if (hit) return hit
      }
    }
  }
  return null
}

/** 逐比例前缀喂流（同一 extractor，模拟真实流式序），返回各帧出帧 */
function feedPrefixes(pcts: number[]): (CxSpec | null)[] {
  const extractor = createNestedExtractor()
  return pcts.map((pct) =>
    extractor.next(scenario.script.slice(0, Math.floor((scenario.script.length * pct) / 100))),
  )
}

/** 取数组主字段长度（物料缺席或主数组未开始返回 -1） */
function arrayLen(spec: CxSpec | null, key: string, arrayKey: string): number {
  if (!spec) return -1
  const node = findByKey(spec, key)
  const rows = node?.data?.[arrayKey]
  return Array.isArray(rows) ? rows.length : -1
}

describe('R3.1 剧本序列化切片', () => {
  it('chunks join 后与 script 逐位一致，且不止一个 chunk', () => {
    expect(scenario.chunks.join('')).toBe(scenario.script)
    expect(scenario.chunks.length).toBeGreaterThan(1)
  })

  it('script 含 ```json 围栏且围栏内为完整 JSON', () => {
    expect(scenario.script.startsWith('```json\n')).toBe(true)
    expect(scenario.script.endsWith('\n```')).toBe(true)
    const inner = scenario.script.slice('```json\n'.length, -'\n```'.length)
    expect(() => JSON.parse(inner)).not.toThrow()
  })

  it('非末 chunk 边界落在行边界', () => {
    for (const [i, chunk] of scenario.chunks.entries()) {
      if (i < scenario.chunks.length - 1) {
        expect(chunk.endsWith('\n'), `chunk#${i}`).toBe(true)
      }
    }
  })

  it('detector 对 script 检测 success 且 specs 数为 1', () => {
    const detector = createSpecDetector(cxSpecDetectorConfig)
    const result = detector.extractSpecs(scenario.script)
    expect(result.status).toBe('success')
    expect(result.specs).toHaveLength(1)
  })
})

describe('R3.2 树级增量出帧', () => {
  it('注册表覆盖 nested 剧本根 key', () => {
    const registry = createPageTriggerRegistry()
    expect(registry.has(scenario.rootKey)).toBe(true)
  })

  it('50% 前缀出帧非 null，且节点序列为终态的前缀子集（证伪假骨架）', () => {
    const extractor = createNestedExtractor()
    const half = scenario.script.slice(0, Math.floor(scenario.script.length / 2))
    const partial = extractor.next(half)
    expect(partial).not.toBeNull()

    const partialKeys = collectKeys(partial)
    const finalKeys = collectKeys(extractor.next(scenario.script))
    expect(partialKeys.length).toBeGreaterThan(0)
    expect(partialKeys.length).toBeLessThan(finalKeys.length)
    // 前缀子集：剔除语义下被剔节点在文档序上必位于已传输文本尾部，
    // 逐项相等依然成立——任何伪造/乱序节点都会破坏相等而变红
    expect(partialKeys).toEqual(finalKeys.slice(0, partialKeys.length))
  })

  it('各比例前缀出帧树均不存在 key 未传完的部分节点', () => {
    for (const pct of [10, 25, 35, 40, 50, 65, 70, 85, 90, 95]) {
      const extractor = createNestedExtractor()
      const prefix = scenario.script.slice(0, Math.floor((scenario.script.length * pct) / 100))
      const partial = extractor.next(prefix)
      if (!partial) continue
      const noKey = collectAllNodes(partial).filter((n) => n.key === undefined)
      expect(noKey, `@${pct}% 存在无 key 节点`).toEqual([])
    }
  })

  it('data-table 行数随前缀单调不减至 3，中途帧出现部分行数（逐行生长真实发生）', () => {
    const pcts = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
    const counts = feedPrefixes(pcts).map((spec) => arrayLen(spec, 'cx-vtu-data-table', 'data'))
    const seen = counts.filter((n) => n >= 0)
    for (let i = 1; i < seen.length; i++) {
      expect(seen[i]!).toBeGreaterThanOrEqual(seen[i - 1]!)
    }
    expect(counts.at(-1)).toBe(3)
    expect(seen.some((n) => n > 0 && n < 3)).toBe(true)
  })

  it('plan todos 随前缀单调不减至 3（外层 sibling array 独立生长）', () => {
    const pcts = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
    const counts = feedPrefixes(pcts).map((spec) => arrayLen(spec, 'cx-vtu-plan', 'todos'))
    const seen = counts.filter((n) => n >= 0)
    for (let i = 1; i < seen.length; i++) {
      expect(seen[i]!).toBeGreaterThanOrEqual(seen[i - 1]!)
    }
    expect(counts.at(-1)).toBe(3)
    expect(seen.some((n) => n > 0 && n < 3)).toBe(true)
  })

  it('scalar 骨架标记中途帧出现、终态帧消失且 content 完整', () => {
    // article 的 key 在剧本前段闭合、content 长文后段才闭合，固定单点断言
    // 可能撞上未挂载窗口构成假绿——循环收集各比例帧显式断言
    const markerStates: boolean[] = []
    for (const spec of feedPrefixes([10, 20, 30, 40, 50, 60, 70, 80, 90])) {
      const article = spec ? findByKey(spec, 'cx-vtu-article') : null
      if (article) {
        const streaming = article.data?._cx_streaming
        markerStates.push(Array.isArray(streaming) && streaming.length > 0)
      }
    }
    expect(markerStates.length).toBeGreaterThan(0)
    expect(markerStates).toContain(true)

    const finalSpec = createNestedExtractor().next(scenario.script)
    const finalArticle = findByKey(finalSpec, 'cx-vtu-article')
    expect(finalArticle?.data?._cx_streaming).toBeUndefined()
    expect(typeof finalArticle?.data?.content).toBe('string')
    expect((finalArticle?.data?.content as string).length).toBeGreaterThan(0)
  })

  it('region 分区揭示：存在仅 header 的中途帧；default 出现时 header 必已揭示', () => {
    const slotSets: string[][] = []
    for (const spec of feedPrefixes([10, 20, 30, 40, 50, 60, 70, 80, 90])) {
      const card = spec ? findByKey(spec, 'cx-nuxt-ui-v4-card') : null
      if (card?.components && !Array.isArray(card.components)) {
        slotSets.push(Object.keys(card.components))
      }
    }
    expect(slotSets.length).toBeGreaterThan(0)
    // 文档序 header 先于 default 闭合：存在 card 仅揭示 header 的帧
    expect(slotSets.some((slots) => slots.length === 1 && slots[0] === 'header')).toBe(true)
    // default 出现的帧必含 header（揭示顺序不颠倒）
    for (const slots of slotSets) {
      if (slots.includes('default')) {
        expect(slots).toContain('header')
      }
    }
  })

  it('终态帧：card 含 header + default 且无 footer（未传输 slot 不出现），全量节点齐备', () => {
    const finalSpec = createNestedExtractor().next(scenario.script)
    const card = findByKey(finalSpec, 'cx-nuxt-ui-v4-card')
    expect(card?.components && !Array.isArray(card.components)).toBe(true)
    const slots = Object.keys(card!.components as Record<string, unknown>)
    expect(slots).toContain('header')
    expect(slots).toContain('default')
    expect(slots).not.toContain('footer')

    const keys = collectKeys(finalSpec)
    expect(keys).toContain('summary-article:cx-vtu-article')
    expect(keys).toContain('member-table:cx-vtu-data-table')
    expect(keys).toContain('launch-plan:cx-vtu-plan')
  })
})
