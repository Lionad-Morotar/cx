import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createIncrementalExtractor, matchCxTrigger } from '@lionad/cx-stream'

import { CxTanstackCharts } from '../src/index'
import {
  TANSTACK_CHARTS_STREAM_TRIGGERS,
  createTanstackChartsTriggerRegistry,
} from '../src/stream-triggers'

import type { ArraySectionConfig, CxSpec, CxStreamNode } from '@lionad/cx-stream'

/**
 * stream-trigger 判定与回放链路契约：
 * - 注册完备与计数校验（6 array 全适用：预设 5 件主数组 data + chart 通配主数组，
 *   0 scalar 0 不适用，差集派生兜底）；
 * - chart array 数据顶层化语义：key 检出无帧（数据数组缺席不产出，pending 由渲染
 *   管线承担）、首行闭合出帧且 definition 必完整（序列化序前置）、行数单调
 *   递增、空数组终态经 emptyPassthrough 透传（组件空态接管）、多数据集形态
 *   （桑基 nodes+links）接力生长且中间帧挂载不抛错；
 * - 5 预设真实样本前缀播放增量收敛（行数单调递增、终态满行）；
 * - 增量帧喂包装层全链路实证：中间帧 data 挂载不抛错、svg 存在——序列化序
 *   使通道字段先于行闭合，且 composable 对通道缺席有回退（LLM 乱序场景双保险）。
 */
const fakeComp = (key: string) => ({ id: `test-${key}`, key, data: {}, components: {} })

const byKey = (key: string) => CxTanstackCharts.find((x: any) => x._cx_meta.key === key)!

/** meta.props 初值展开（函数 initial 调用取值），与页面 buildDefaultData 同语义 */
const initialDataOf = (meta: any): Record<string, any> => {
  const data: Record<string, any> = {}
  for (const [key, prop] of Object.entries<any>(meta.props)) {
    data[key] = typeof prop.initial === 'function' ? prop.initial() : prop.initial
  }
  return data
}

const REAL_ROWS = 4

/** 真实样本剧本：initial 全字段 + 主数组循环扩充到 REAL_ROWS 保证可观察窗口 */
function realScriptOf(key: string): string {
  const data = initialDataOf(byKey(key)._cx_meta)
  const arr = data.data as unknown[]
  data.data = Array.from({ length: REAL_ROWS }, (_, i) => arr[i % arr.length])
  const node: CxStreamNode = { id: `test-${key}`, key, data }
  return JSON.stringify(node, null, 2)
}

const extractorOf = () =>
  createIncrementalExtractor<CxSpec>({
    registry: createTanstackChartsTriggerRegistry(),
    matchTrigger: matchCxTrigger,
  })

const ARRAY_KEYS = [
  'cx-tanstack-charts-line',
  'cx-tanstack-charts-bar',
  'cx-tanstack-charts-area',
  'cx-tanstack-charts-dot',
  'cx-tanstack-charts-pie',
] as const

describe('stream-trigger 判定完备性', () => {
  it('注册表恰 6 件：6 array + 0 scalar，物料差集为零（无不适用）', () => {
    const registry = createTanstackChartsTriggerRegistry()
    expect(registry.size).toBe(TANSTACK_CHARTS_STREAM_TRIGGERS.length)
    expect(TANSTACK_CHARTS_STREAM_TRIGGERS).toHaveLength(6)
    const arrayCount = TANSTACK_CHARTS_STREAM_TRIGGERS.filter((c) =>
      c.sections.some((s) => s.kind === 'array'),
    ).length
    const scalarCount = TANSTACK_CHARTS_STREAM_TRIGGERS.filter((c) =>
      c.sections.some((s) => s.kind === 'scalar'),
    ).length
    expect(arrayCount).toBe(6)
    expect(scalarCount).toBe(0)
    // 差集派生：物料 key 集 - trigger key 集应为空（6 全适用、0 不适用）
    const notApplicable = (CxTanstackCharts as any[])
      .map((m) => m._cx_meta.key as string)
      .filter((key) => !TANSTACK_CHARTS_STREAM_TRIGGERS.some((c) => c.key === key))
    expect(notApplicable).toEqual([])
    for (const config of TANSTACK_CHARTS_STREAM_TRIGGERS) {
      expect(registry.has(config.key), `${config.key} 应在注册表内`).toBe(true)
    }
  })

  it('array 触发器扫描路径：预设主数组 data、chart 通配主数组（frameStride 10）', () => {
    for (const config of TANSTACK_CHARTS_STREAM_TRIGGERS) {
      expect(config.frameStride).toBe(10)
      const array = config.sections.find((s): s is ArraySectionConfig => s.kind === 'array')
      expect(array, `${config.key} 应为 array 形态`).toBeTruthy()
    }
    for (const key of ARRAY_KEYS) {
      const config = TANSTACK_CHARTS_STREAM_TRIGGERS.find((c) => c.key === key)!
      expect((config.sections[0] as ArraySectionConfig).arrayKey).toBe('data')
    }
    const chart = TANSTACK_CHARTS_STREAM_TRIGGERS.find((c) => c.key === 'cx-chart')!
    const chartArray = chart.sections[0] as ArraySectionConfig
    // 通配主数组：rows / nodes+links / innerRows+outerRows 等多数据形态统一流式
    expect(chartArray.arrayKey).toBe('*')
    // 空数组终态透传（组件空态接管，防流结束后 pending 永驻）
    expect(chart.stateBranch?.emptyPassthrough).toBe(true)
  })
})

describe('chart array 形态 · 数据顶层化回放', () => {
  /** chart 真实样本剧本：initial 全字段 + 主数组 rows 循环扩充到 REAL_ROWS */
  function realChartScriptOf(): string {
    const data = initialDataOf(byKey('cx-chart')._cx_meta)
    const rows = data.rows as unknown[]
    data.rows = Array.from({ length: REAL_ROWS }, (_, i) => rows[i % rows.length])
    const node: CxStreamNode = { id: 'test-cx-chart', key: 'cx-chart', data }
    return JSON.stringify(node)
  }

  it('key 检出无帧：array 形态主数组缺席不产出（pending 由渲染管线承担）', () => {
    expect(extractorOf().next('{"key":"cx-chart"')).toBeNull()
  })

  it('rows 首行闭合即出帧且 definition 完整在场（序列化序 definition 先于 rows）', () => {
    const script = realChartScriptOf()
    const extractor = extractorOf()
    // 步进前缀找首个 1 行帧（语义定位，不与剧本序列化格式耦合）
    let firstRow: CxStreamNode | null = null
    const step = Math.max(1, Math.floor(script.length / 120))
    for (let i = step; i < script.length && !firstRow; i += step) {
      const partial = extractor.next(script.slice(0, i)) as CxStreamNode | null
      if (partial && (partial.data?.rows as unknown[])?.length === 1) firstRow = partial
    }
    expect(firstRow, 'rows 首行闭合即出帧').not.toBeNull()
    const definition = firstRow!.data?.definition as { marks?: unknown[] } | undefined
    expect(
      definition?.marks?.length,
      'definition 序列化在 rows 前，首行帧必携完整 marks',
    ).toBeGreaterThan(0)
  })

  it('rows 行数单调递增收敛到满行，终态全字段一致', () => {
    const script = realChartScriptOf()
    const extractor = extractorOf()
    const counts: number[] = []
    const step = Math.max(1, Math.floor(script.length / 40))
    for (let i = step; i < script.length; i += step) {
      const partial = extractor.next(script.slice(0, i)) as CxStreamNode | null
      if (partial) counts.push(((partial.data?.rows as unknown[]) ?? []).length)
    }
    const final = extractor.next(script) as CxStreamNode | null
    expect(final?.key).toBe('cx-chart')
    expect((final?.data?.rows as unknown[]).length).toBe(REAL_ROWS)
    expect(counts.length, '应有可观察的增量窗口').toBeGreaterThan(0)
    expect(counts[0], '首帧应少于完整行数').toBeLessThan(REAL_ROWS)
    for (let i = 1; i < counts.length; i++) {
      expect(counts[i]).toBeGreaterThanOrEqual(counts[i - 1]!)
    }
  })

  it('首行帧喂包装层全链路挂载不抛错、svg 在场（marks 字符串引用解析到部分 rows）', () => {
    const script = realChartScriptOf()
    const extractor = extractorOf()
    let firstRow: CxStreamNode | null = null
    const step = Math.max(1, Math.floor(script.length / 120))
    for (let i = step; i < script.length && !firstRow; i += step) {
      const partial = extractor.next(script.slice(0, i)) as CxStreamNode | null
      if (partial && (partial.data?.rows as unknown[])?.length === 1) firstRow = partial
    }
    expect(firstRow).not.toBeNull()
    const wrapper = mount(byKey('cx-chart'), {
      props: { comp: fakeComp('cx-chart'), ...(firstRow!.data as Record<string, unknown>) },
    })
    expect(wrapper.find('.ts-chart-host').exists()).toBe(true)
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('空 rows 终态经 emptyPassthrough 透传（容器闭合 0 元素 → 组件空态接管）', () => {
    const data = { ...initialDataOf(byKey('cx-chart')._cx_meta), rows: [] }
    const script = JSON.stringify({ id: 'c-empty', key: 'cx-chart', data })
    const final = extractorOf().next(script) as CxStreamNode | null
    expect(final, '空 rows 终态应透传而非永驻 pending').not.toBeNull()
    expect(final?.data?.rows).toEqual([])
  })

  /** 桑基形剧本：definition 在先（通道字段完整——序列化序保证增量帧必携），
   * nodes 与 links 两个数据数组按序列化序接力 */
  function sankeyScriptOf(): string {
    const data = {
      definition: {
        marks: [
          {
            type: 'sankey',
            nodes: 'nodes',
            links: 'links',
            nodeKey: 'id',
            source: 'source',
            target: 'target',
            value: 'value',
          },
        ],
      },
      nodes: Array.from({ length: REAL_ROWS }, (_, i) => ({ id: `n${i}` })),
      links: Array.from({ length: REAL_ROWS * 2 }, (_, i) => ({
        source: `n${i % REAL_ROWS}`,
        target: `n${(i + 1) % REAL_ROWS}`,
        value: i + 1,
      })),
    }
    return JSON.stringify({ id: 'test-sankey', key: 'cx-chart', data })
  }

  it('多数据集形态流式：nodes 与 links 各自逐条生长、单调递增收敛到满量', () => {
    const script = sankeyScriptOf()
    const extractor = extractorOf()
    const nodeCounts: number[] = []
    const linkCounts: number[] = []
    const step = Math.max(1, Math.floor(script.length / 60))
    for (let i = step; i < script.length; i += step) {
      const partial = extractor.next(script.slice(0, i)) as CxStreamNode | null
      if (partial) {
        nodeCounts.push(((partial.data?.nodes as unknown[]) ?? []).length)
        linkCounts.push(((partial.data?.links as unknown[]) ?? []).length)
      }
    }
    const final = extractor.next(script) as CxStreamNode | null
    expect((final?.data?.nodes as unknown[]).length).toBe(REAL_ROWS)
    expect((final?.data?.links as unknown[]).length).toBe(REAL_ROWS * 2)
    expect(nodeCounts.length, '应有可观察的增量窗口').toBeGreaterThan(0)
    expect(nodeCounts[0], '首帧应少于完整节点数').toBeLessThan(REAL_ROWS)
    expect(linkCounts[0], 'links 序列化在 nodes 后，首帧缺席计 0').toBe(0)
    for (let i = 1; i < nodeCounts.length; i++) {
      expect(nodeCounts[i]).toBeGreaterThanOrEqual(nodeCounts[i - 1]!)
    }
    for (let i = 1; i < linkCounts.length; i++) {
      expect(linkCounts[i]).toBeGreaterThanOrEqual(linkCounts[i - 1]!)
    }
  })

  it('桑基中间帧（部分 nodes+links）喂包装层挂载不抛错、svg 在场', () => {
    const script = sankeyScriptOf()
    const extractor = extractorOf()
    let mid: CxStreamNode | null = null
    const step = Math.max(1, Math.floor(script.length / 60))
    for (let i = step; i < script.length && !mid; i += step) {
      const partial = extractor.next(script.slice(0, i)) as CxStreamNode | null
      if (partial && ((partial.data?.links as unknown[]) ?? []).length >= 1) mid = partial
    }
    expect(mid, '应存在含部分 links 的中间帧').not.toBeNull()
    const wrapper = mount(byKey('cx-chart'), {
      props: { comp: fakeComp('cx-chart'), ...(mid!.data as Record<string, unknown>) },
    })
    expect(wrapper.find('.ts-chart-host').exists()).toBe(true)
    expect(wrapper.find('svg').exists()).toBe(true)
  })
})

describe('预设 array 形态 · 前缀播放增量收敛', () => {
  it.each(ARRAY_KEYS)('%s 行数单调递增收敛到满行', (key) => {
    const script = realScriptOf(key)
    const extractor = extractorOf()
    const counts: number[] = []
    const step = Math.max(1, Math.floor(script.length / 40))
    for (let i = step; i < script.length; i += step) {
      const partial = extractor.next(script.slice(0, i)) as CxStreamNode | null
      if (partial) counts.push(((partial.data?.data as unknown[]) ?? []).length)
    }
    const final = extractor.next(script) as CxStreamNode | null
    expect(final?.key).toBe(key)
    expect((final?.data?.data as unknown[]).length).toBe(REAL_ROWS)
    expect(counts.length, `${key} 应有可观察的增量窗口`).toBeGreaterThan(0)
    expect(counts[0], `${key} 首帧应少于完整行数`).toBeLessThan(REAL_ROWS)
    for (let i = 1; i < counts.length; i++) {
      expect(counts[i]).toBeGreaterThanOrEqual(counts[i - 1]!)
    }
  })

  it.each(ARRAY_KEYS)('%s 首行帧经包装层全链路挂载不抛错、svg 在场', (key) => {
    const script = realScriptOf(key)
    const extractor = extractorOf()
    // 步进前缀找首个 1 行帧（语义定位，不与剧本序列化格式耦合）
    let firstRow: CxStreamNode | null = null
    const step = Math.max(1, Math.floor(script.length / 120))
    for (let i = step; i < script.length && !firstRow; i += step) {
      const partial = extractor.next(script.slice(0, i)) as CxStreamNode | null
      if (partial && (partial.data?.data as unknown[])?.length === 1) firstRow = partial
    }
    expect(firstRow, '首行闭合即出帧').not.toBeNull()
    // 声明序通道字段前置：首行帧即携带通道配置（x/y 或 name/value）
    const wrapper = mount(byKey(key), {
      props: { comp: fakeComp(key), ...(firstRow!.data as Record<string, unknown>) },
    })
    expect(wrapper.find('.ts-chart-host').exists()).toBe(true)
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('通道字段缺席的中间帧（LLM 乱序场景）挂载不抛错——composable 回退双保险', () => {
    // 构造只有 data 行、无 x/y 的帧（字段序不受控时的最坏中间态）
    for (const key of ARRAY_KEYS) {
      const data = initialDataOf(byKey(key)._cx_meta)
      const rowsOnly = { data: data.data }
      expect(() =>
        mount(byKey(key), { props: { comp: fakeComp(`bare-${key}`), ...rowsOnly } }),
      ).not.toThrow()
    }
  })
})
