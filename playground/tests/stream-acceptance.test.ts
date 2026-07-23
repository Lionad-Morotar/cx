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
} from '@lionad/cx-stream'

import {
  createDemoRegistry,
  DEMO_TABLE_SPEC,
  STREAM_SCRIPT,
  toRenderNode,
} from '../app/dev/stream-scenario'

// /dev/stream 验收页的无头契约：以「一根不断生长的字符串」驱动管线，
// 不依赖页面定时器，确定性断言三态转移与增量行为。

const detector = createSpecDetector(cxSpecDetectorConfig)

// 围栏起点与「围栏头 + 换行」长度，用于截取流式中途的前缀
const FENCE = '```json'
const fenceStart = STREAM_SCRIPT.indexOf(FENCE)
const jsonBodyStart = fenceStart + FENCE.length + 1 // 跳过 ```json 与换行

describe('stream 验收 · 三态漏斗', () => {
  it('散文阶段（围栏未出现）检出 none', () => {
    const proseOnly = STREAM_SCRIPT.slice(0, fenceStart)
    expect(detector.extractSpecs(proseOnly).status).toBe('none')
  })

  it('流式中途（围栏已开、JSON 未闭合）检出 pending 且隔离原始 JSON', () => {
    const partial = STREAM_SCRIPT.slice(0, jsonBodyStart + 40)
    const result = detector.extractSpecs(partial)
    expect(result.status).toBe('pending')
    expect(result.pendingSources).toHaveLength(1)
    // pending 内容被占位符替换，原始 JSON 不泄漏到 markdown 渲染层
    expect(result.content).not.toContain('"key"')
  })

  it('围栏闭合后检出 success 且 spec 为 data-table 节点', () => {
    const result = detector.extractSpecs(STREAM_SCRIPT)
    expect(result.status).toBe('success')
    expect(result.specs).toHaveLength(1)
    expect(result.spec).toMatchObject({
      key: 'cx-vtu-data-table',
      id: DEMO_TABLE_SPEC.id,
    })
  })
})

// 截取「第 n 行（0 基）行对象刚好闭合」的流式前缀：围栏仍未闭合，
// 用以验证 JSON 未闭合阶段增量渲染即可见到逐步增长的行。
const ROW_NAMES = ['Alice', 'Bob', 'Carol', 'Dave']
function prefixThroughRow(n: number): string {
  const nameIdx = STREAM_SCRIPT.indexOf(`"name": "${ROW_NAMES[n]}"`)
  const rowClose = STREAM_SCRIPT.indexOf('}', nameIdx)
  return STREAM_SCRIPT.slice(0, rowClose + 1)
}

describe('stream 验收 · 增量渲染（Route Z）', () => {
  it('未闭合阶段增量行数随行到达单调递增', () => {
    const extractor = createIncrementalExtractor<CxSpec>({
      registry: createDemoRegistry(),
      matchTrigger: matchCxTrigger,
    })
    const counts = [0, 1, 2, 3].map((n) => {
      const partial = extractor.next(prefixThroughRow(n)) as { data?: { data?: unknown[] } } | null
      return partial?.data?.data?.length ?? 0
    })
    expect(counts).toEqual([1, 2, 3, 4])
  })

  it('首行未闭合时数据不足，保持 null（渲染端不闪没由 lastValid 负责）', () => {
    const extractor = createIncrementalExtractor<CxSpec>({
      registry: createDemoRegistry(),
      matchTrigger: matchCxTrigger,
    })
    // 截到行数组刚打开、尚无完整行：columns 已完整，data 数组为空
    const rowsArrayOpen = STREAM_SCRIPT.indexOf('"data": [')
    const columnsOnly = STREAM_SCRIPT.slice(0, rowsArrayOpen + '"data": ['.length)
    expect(extractor.next(columnsOnly)).toBeNull()
  })

  it('toRenderNode 补稳定 id 并保留 key/data', () => {
    const node = toRenderNode(DEMO_TABLE_SPEC)
    expect(node.id).toBe('stream-demo-table')
    expect(node.key).toBe('cx-vtu-data-table')
    expect(node.data).toMatchObject(DEMO_TABLE_SPEC.data)
  })

  it('toRenderNode 对缺省 id 的节点回填可用 id', () => {
    const node = toRenderNode({ key: 'cx-text', data: { content: 'x' } })
    expect(node.id).toBeTruthy()
    expect(node.key).toBe('cx-text')
  })
})

describe('stream 验收 · 打字机素材与流式切分', () => {
  it('pending 阶段从部分 JSON 提取出有意义的人类文本', () => {
    // prefixThroughRow(0) 已含 CJK 字段值（团队成员/名称/管理员…）
    const text = extractDisplayText(prefixThroughRow(0), cxHumanTextConfig)
    expect(text).toBeTruthy()
    expect(text!.length).toBeGreaterThan(0)
  })

  it('useStreamChunks 按段落标记把成长文本切成完整块 + 未完成尾块', () => {
    const { chunks } = useStreamChunks(ref(STREAM_SCRIPT), [{ marker: '\n\n', offset: 2 }])
    expect(chunks.value).toHaveLength(3)
    expect(chunks.value[0].content).toContain('整理成了一张表格')
    expect(chunks.value[0].isComplete).toBe(true)
    expect(chunks.value[chunks.value.length - 1].isComplete).toBe(false)
  })
})
