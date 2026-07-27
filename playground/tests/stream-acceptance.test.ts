import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import {
  createIncrementalExtractor,
  createSpecDetector,
  cxHumanTextConfig,
  cxSpecDetectorConfig,
  extractDisplayText,
  matchCxTrigger,
  useStreamChunks,
  type CxSpec,
  type CxStreamNode,
} from '@lionad/cx-stream'

import { compositeMeta } from '../app/dev/stream-mock.generated'
import {
  createDemoRegistry,
  STREAM_CHUNKS,
  STREAM_SCRIPT,
  toRenderNode,
} from '../app/dev/stream-scenario'

// /dev/stream 验收页的无头契约：以「一根不断生长的字符串」驱动管线，
// 不依赖页面定时器，确定性断言三态转移与增量行为。
//
// 断言全部基于 detector/extractor 的语义输出（status、specs、pendingSources、
// 行数），不锚定任何字符位置与 JSON 序列化风格——剧本内容由生成产物决定，
// 位置敏感锚点会在每次剧本调整时静默错位（管线正常、测试全红的误判来源）。

const detector = createSpecDetector(cxSpecDetectorConfig)

/** 播放到第 n 个 chunk 的流式前缀 */
const prefix = (n: number): string => STREAM_CHUNKS.slice(0, n).join('')

describe('stream 验收 · 三态漏斗（多围栏）', () => {
  it('status 一次成型：none→pending→success，首围栏闭合后即锁定', () => {
    // 多围栏下 status 不循环：混合态（部分围栏闭合 + 部分在流）归 success，
    // 后续围栏的流式进度体现在 specs 增长与 pendingSources 上，不在 status 上。
    // 另注意 detector 快速识别要求完整 `"id"`/`"key"` token（含闭合引号），
    // delta 边界切在 token 中间时 status 瞬时回落 none、下一拍恢复——
    // 断言前把「见过围栏后的 none」折叠回 pending，聚焦宏观状态机
    let fenceSeen = false
    const transitions: string[] = []
    let prev = 'none'
    for (let i = 1; i <= STREAM_CHUNKS.length; i++) {
      const raw = detector.extractSpecs(prefix(i)).status
      if (raw !== 'none') fenceSeen = true
      const status = fenceSeen && raw === 'none' ? ('pending' as const) : raw
      if (status !== prev) {
        transitions.push(`${prev}→${status}`)
        prev = status
      }
    }
    expect(transitions).toEqual(['none→pending', 'pending→success'])
  })

  it('specs 逐围栏单调增长，且每个围栏闭合前都有可观察的流式窗口', () => {
    const total = detector.extractSpecs(STREAM_SCRIPT).specs.length

    const growth: number[] = []
    let maxSpecs = 0
    for (let i = 1; i <= STREAM_CHUNKS.length; i++) {
      const result = detector.extractSpecs(prefix(i))
      if (result.specs.length > maxSpecs) {
        maxSpecs = result.specs.length
        growth.push(result.specs.length)
      }
    }
    expect(growth).toEqual(Array.from({ length: total }, (_, i) => i + 1))

    // 逐围栏存在性断言（而非窗口计数）：delta 边界切在 `"id"`/`"key"` token
    // 中间时，未闭合块会瞬时退出 blocks——首围栏表现为回落 none，后续围栏
    // 表现为 success 但 pendingSources 短暂缺席，窗口计数会被这种一拍振荡
    // 切碎；存在性断言对单拍振荡天然免疫
    for (let fenceIndex = 0; fenceIndex < total; fenceIndex++) {
      let observed = false
      for (let i = 1; i <= STREAM_CHUNKS.length; i++) {
        const result = detector.extractSpecs(prefix(i))
        if (result.specs.length === fenceIndex && (result.pendingSources?.length ?? 0) > 0) {
          observed = true
          break
        }
      }
      expect(observed, `fence#${fenceIndex} 闭合前应有流式窗口`).toBe(true)
    }
  })

  it('流式全程渲染层 content 不泄漏任何 spec 原始 JSON', () => {
    // 闭合围栏由 widget 占位符替换、未闭合由 pending 占位符替换；
    // status none 时 content 缺省（纯散文无隔离需求），按空串处理。
    // 采样播放以降低 O(n²) 全量回放的断言耗时
    for (let i = 1; i <= STREAM_CHUNKS.length; i += 25) {
      const result = detector.extractSpecs(prefix(i))
      expect(result.content ?? '').not.toContain('"key": "cx-vtu-')
    }
  })

  it('终态检出全部围栏，spec 顺序与生成元信息一致', () => {
    const result = detector.extractSpecs(STREAM_SCRIPT)
    expect(result.status).toBe('success')
    const keys = result.specs.map((s) => (Array.isArray(s) ? s[0]?.key : s.key))
    expect(keys).toEqual([...compositeMeta.componentKeys])
  })
})

describe('stream 验收 · 增量渲染（Route Z）', () => {
  it('首个围栏流式期间增量行数单调递增，闭合时达到完整行数', () => {
    const extractor = createIncrementalExtractor<CxSpec>({
      registry: createDemoRegistry(),
      matchTrigger: matchCxTrigger,
    })
    // 完整行数从终态 spec 语义获取：首个围栏即 data-table
    const finalTable = detector.extractSpecs(STREAM_SCRIPT).specs[0] as CxStreamNode
    const totalRows = (finalTable.data?.data as unknown[]).length
    expect(totalRows).toBeGreaterThan(1)

    // 逐 chunk 播放直到首个围栏闭合（status 首次变为 success），
    // 期间收集增量管线产出的行数
    const counts: number[] = []
    let nullFrames = 0
    for (let i = 1; i <= STREAM_CHUNKS.length; i++) {
      const text = prefix(i)
      if (detector.extractSpecs(text).status === 'success') break
      const partial = extractor.next(text) as { data?: { data?: unknown[] } } | null
      if (partial === null) {
        nullFrames++
        continue
      }
      counts.push(partial.data?.data?.length ?? 0)
    }

    // 散文阶段无扫描匹配，管线保持 null
    expect(nullFrames).toBeGreaterThan(0)
    // 渐进性：行数从少于完整值逐步爬升，而非一次到位
    expect(counts.length).toBeGreaterThan(1)
    expect(counts[0]).toBeLessThan(totalRows)
    expect(counts.at(-1)).toBe(totalRows)
    for (let i = 1; i < counts.length; i++) {
      expect(counts[i]).toBeGreaterThanOrEqual(counts[i - 1]!)
    }
  })

  it('toRenderNode 补稳定 id 并保留 key/data', () => {
    const fixture: CxStreamNode = {
      id: 'stream-demo-table',
      key: 'cx-vtu-data-table',
      data: { columns: [], data: [] },
    }
    const node = toRenderNode(fixture)
    expect(node.id).toBe('stream-demo-table')
    expect(node.key).toBe('cx-vtu-data-table')
    expect(node.data).toMatchObject(fixture.data!)
  })

  it('toRenderNode 对缺省 id 的节点回填可用 id', () => {
    const node = toRenderNode({ key: 'cx-text', data: { content: 'x' } })
    expect(node.id).toBeTruthy()
    expect(node.key).toBe('cx-text')
  })
})

describe('stream 验收 · 打字机素材与流式切分', () => {
  it('pending 阶段从部分 JSON 提取出有意义的人类文本', () => {
    // 语义定位首个 pending 前缀，不假定围栏在剧本中的字符位置
    let pendingPrefix = ''
    for (let i = 1; i <= STREAM_CHUNKS.length; i++) {
      if (detector.extractSpecs(prefix(i)).status === 'pending') {
        pendingPrefix = prefix(i)
        break
      }
    }
    expect(pendingPrefix).not.toBe('')
    const text = extractDisplayText(pendingPrefix, cxHumanTextConfig)
    expect(text).toBeTruthy()
    expect(text!.length).toBeGreaterThan(0)
  })

  it('useStreamChunks 按段落标记把成长文本切成完整块 + 未完成尾块', () => {
    const { chunks } = useStreamChunks(ref(STREAM_SCRIPT), [{ marker: '\n\n', offset: 2 }])
    // 锚定生成产物的具体事实（块数、首/尾散文片段），不从被测输入推导期望——
    // 用 split('\n\n') 算期望值与被测实现同构，会退化成对回归零捕获的循环论证
    expect(chunks.value).toHaveLength(13)
    expect(chunks.value[0]!.content).toContain('已为您查询到当前可租售的园区载体资源')
    expect(chunks.value[0]!.isComplete).toBe(true)
    expect(chunks.value.at(-1)!.isComplete).toBe(false)
    expect(chunks.value.at(-1)!.content).toContain('随时告诉我')
  })
})
