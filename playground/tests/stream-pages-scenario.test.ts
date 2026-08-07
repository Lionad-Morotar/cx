// /dev/stream/pages 验收页的无头契约：页面级 schema（站会列表/日会/周会看板）
// 精简转换 → 流式剧本 → scalar 增量出帧 的全链路行为断言。
// 与 stream-acceptance（组件级管线）并列，锁定页面级「嵌套树按文档序逐节点生长」语义。
import { describe, expect, it } from 'vitest'
import {
  createIncrementalExtractor,
  createSpecDetector,
  cxSpecDetectorConfig,
  matchCxTrigger,
  toStreamNode,
  type CxSpec,
} from '@lionad/cx-stream'

import { createPageTriggerRegistry, PAGE_SCENARIOS } from '~/dev/stream-pages-scenario'
import { dailyStandupDashboardSchema } from '~/standup/schemas/daily-standup-dashboard.schema'
import { standupListSchema } from '~/standup/schemas/standup-list.schema'
import { weeklyStandupDashboardSchema } from '~/standup/schemas/weekly-standup-dashboard.schema'

// 收集节点树中所有层级的对象键集，验证精简白名单（id/key/data/components，name 省略）
function collectFieldNames(node: unknown, out: Set<string> = new Set()): Set<string> {
  if (Array.isArray(node)) {
    for (const n of node) collectFieldNames(n, out)
    return out
  }
  if (node && typeof node === 'object') {
    for (const k of Object.keys(node)) out.add(k)
    const components = (node as { components?: unknown }).components
    if (components && typeof components === 'object') {
      for (const v of Object.values(components)) collectFieldNames(v, out)
    }
  }
  return out
}

describe('R2.1 schema 精简转换', () => {
  it('standupListSchema 转换后嵌套 components 按 slot 名分组保留', () => {
    const nodes = standupListSchema.map(toStreamNode)
    expect(nodes).toHaveLength(1)
    const root = nodes[0]!
    expect(root.key).toBe('cx-page-main')
    const layout = root.components?.['default']?.[0]
    expect(layout?.key).toBe('cx-standup-list-layout')
    const listMain = layout?.components?.['default']?.[1]
    expect(listMain?.key).toBe('cx-standup-list-main')
    const groupList = listMain?.components?.['default']?.[0]
    expect(groupList?.key).toBe('cx-standup-group-list')
    // 模板插槽键（group-item / card-item / header / content）不丢失
    const folder = groupList?.components?.['group-item']?.[0]
    expect(folder?.key).toBe('cx-folder-container')
    expect(folder?.components?.['header']?.[0]?.key).toBe('cx-standup-group-header')
    const cardList = folder?.components?.['content']?.[0]
    expect(cardList?.key).toBe('cx-standup-card-list')
    expect(cardList?.components?.['card-item']?.[0]?.key).toBe('cx-standup-card')
  })

  it('输出每层节点字段不超出 id/key/data/components 白名单', () => {
    const all = [standupListSchema, dailyStandupDashboardSchema, weeklyStandupDashboardSchema]
    for (const schema of all) {
      const fields = collectFieldNames(schema.map(toStreamNode))
      for (const f of fields) {
        expect(['id', 'key', 'data', 'components'], f).toContain(f)
      }
    }
  })

  it('有值 data 透传（user-select 的 enableKeyboardControl）', () => {
    const nodes = dailyStandupDashboardSchema.map(toStreamNode)
    const userSelect = nodes[0]?.components?.['page-content-right']?.[0]
    expect(userSelect?.key).toBe('cx-user-select')
    expect(userSelect?.data).toEqual({ enableKeyboardControl: true })
  })

  it('三份 schema 转换后 JSON 序列化往返根 key 一致', () => {
    const all = [standupListSchema, dailyStandupDashboardSchema, weeklyStandupDashboardSchema]
    for (const schema of all) {
      const round = JSON.parse(JSON.stringify(schema.map(toStreamNode)))
      expect(round[0].key).toBe(schema[0]!.key)
    }
  })
})

describe('R2.2 剧本序列化切片', () => {
  it('三 scenario 覆盖站会列表/日会/周会，rootKey 与源 schema 根一致', () => {
    expect(PAGE_SCENARIOS.map((s) => s.id)).toEqual([
      'standup-list',
      'daily-dashboard',
      'weekly-dashboard',
    ])
    expect(PAGE_SCENARIOS[0]!.rootKey).toBe('cx-page-main')
    expect(PAGE_SCENARIOS[1]!.rootKey).toBe('cx-daily-standard-dashboard-page-layout')
    expect(PAGE_SCENARIOS[2]!.rootKey).toBe('cx-weekly-standup-dashboard-page-layout')
  })

  it('每 scenario 的 chunks join 后与 script 逐位一致', () => {
    for (const s of PAGE_SCENARIOS) {
      expect(s.chunks.join(''), s.id).toBe(s.script)
      expect(s.chunks.length, s.id).toBeGreaterThan(1)
    }
  })

  it('script 含 ```json 围栏且围栏内为完整 JSON', () => {
    for (const s of PAGE_SCENARIOS) {
      expect(s.script.startsWith('```json\n'), s.id).toBe(true)
      expect(s.script.endsWith('\n```'), s.id).toBe(true)
      const inner = s.script.slice('```json\n'.length, -'\n```'.length)
      expect(() => JSON.parse(inner), s.id).not.toThrow()
    }
  })

  it('每个 chunk 边界落在行边界（不以切断字段的方式切分）', () => {
    for (const s of PAGE_SCENARIOS) {
      for (const [i, chunk] of s.chunks.entries()) {
        const isLast = i === s.chunks.length - 1
        // 非末 chunk 必以换行结尾（行边界）；末 chunk 与 script 尾部一致
        if (!isLast) {
          expect(chunk.endsWith('\n'), `${s.id}#${i}`).toBe(true)
        }
      }
    }
  })

  it('detector 对 script 检测 success 且 specs 数为 1', () => {
    const detector = createSpecDetector(cxSpecDetectorConfig)
    for (const s of PAGE_SCENARIOS) {
      const result = detector.extractSpecs(s.script)
      expect(result.status, s.id).toBe('success')
      expect(result.specs, s.id).toHaveLength(1)
    }
  })
})

/** 收集节点树全部对象节点（不过滤 key），用于检出 key 未传完的部分节点 */
function collectAllNodes(node: unknown, out: { id?: string; key?: string }[] = []): { id?: string; key?: string }[] {
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
function collectKeys(node: unknown, out: string[] = []): string[] {
  return collectAllNodes(node).map((n) => `${n.id}:${n.key}`)
}

describe('R2.3 页面级增量 trigger', () => {
  it('注册表覆盖三个页面根 key', () => {
    const registry = createPageTriggerRegistry()
    for (const s of PAGE_SCENARIOS) {
      expect(registry.has(s.rootKey), s.rootKey).toBe(true)
    }
  })

  it('任一页面剧本 50% 前缀出帧非 null，且节点序列为终态的前缀子集（证伪假骨架）', () => {
    for (const s of PAGE_SCENARIOS) {
      const extractor = createIncrementalExtractor<CxSpec>({
        registry: createPageTriggerRegistry(),
        matchTrigger: matchCxTrigger,
      })
      const half = s.script.slice(0, Math.floor(s.script.length / 2))
      const partial = extractor.next(half)
      expect(partial, `${s.id} 50% 出帧`).not.toBeNull()

      const partialKeys = collectKeys(partial)
      const finalKeys = collectKeys(extractor.next(s.script))
      expect(partialKeys.length, `${s.id} 中途帧应小于终态`).toBeGreaterThan(0)
      expect(partialKeys.length, `${s.id} 中途帧应小于终态`).toBeLessThan(finalKeys.length)
      // 前缀子集：中途帧节点序列与终态序列前 N 项逐项相等——
      // 任何未传输节点混入（jsonrepair 伪造/乱序）都会破坏逐项相等而变红
      expect(partialKeys, `${s.id} 前缀子集`).toEqual(finalKeys.slice(0, partialKeys.length))
    }
  })

  it('出帧树不存在 key 未传完的部分节点（buildPartial 修剪契约）', () => {
    // 「id 已闭合、key 未传输」的截断帧合法存在（closingBrackets 补全产物），
    // 但 buildPartial 必须将其修剪——否则穿透到渲染层成 key=undefined 节点，
    // 增量语义从「完整前缀」退化为「前缀 + 半节点」。
    for (const s of PAGE_SCENARIOS) {
      for (const pct of [10, 25, 35, 40, 50, 65, 70, 85, 90, 95]) {
        const extractor = createIncrementalExtractor<CxSpec>({
          registry: createPageTriggerRegistry(),
          matchTrigger: matchCxTrigger,
        })
        const prefix = s.script.slice(0, Math.floor((s.script.length * pct) / 100))
        const partial = extractor.next(prefix)
        if (!partial) continue
        const noKey = collectAllNodes(partial).filter((n) => n.key === undefined)
        expect(noKey, `${s.id}@${pct}% 存在无 key 节点`).toEqual([])
      }
    }
  })

  it('完整文本出帧节点集合与源 schema 全量一致', () => {
    const all = [standupListSchema, dailyStandupDashboardSchema, weeklyStandupDashboardSchema]
    for (const [i, s] of PAGE_SCENARIOS.entries()) {
      const extractor = createIncrementalExtractor<CxSpec>({
        registry: createPageTriggerRegistry(),
        matchTrigger: matchCxTrigger,
      })
      const finalKeys = collectKeys(extractor.next(s.script)).sort()
      const sourceKeys = collectKeys(all[i]!.map(toStreamNode)).sort()
      expect(finalKeys, s.id).toEqual(sourceKeys)
    }
  })
})
