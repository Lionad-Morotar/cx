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
 * - 注册完备与计数校验（6 = 5 array + 1 scalar + 0 不适用，差集派生兜底）；
 * - chart scalar 空壳帧 fallback 与终态全字段（definition 检出即空壳、闭合即完整揭示）；
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
  it('注册表恰 6 件：5 array + 1 scalar，物料差集为零（无不适用）', () => {
    const registry = createTanstackChartsTriggerRegistry()
    expect(registry.size).toBe(TANSTACK_CHARTS_STREAM_TRIGGERS.length)
    expect(TANSTACK_CHARTS_STREAM_TRIGGERS).toHaveLength(6)
    const arrayCount = TANSTACK_CHARTS_STREAM_TRIGGERS.filter((c) =>
      c.sections.some((s) => s.kind === 'array'),
    ).length
    const scalarCount = TANSTACK_CHARTS_STREAM_TRIGGERS.filter((c) =>
      c.sections.some((s) => s.kind === 'scalar'),
    ).length
    expect(arrayCount).toBe(5)
    expect(scalarCount).toBe(1)
    // 差集派生：物料 key 集 - trigger key 集应为空（6 全适用、0 不适用）
    const notApplicable = (CxTanstackCharts as any[])
      .map((m) => m._cx_meta.key as string)
      .filter((key) => !TANSTACK_CHARTS_STREAM_TRIGGERS.some((c) => c.key === key))
    expect(notApplicable).toEqual([])
    for (const config of TANSTACK_CHARTS_STREAM_TRIGGERS) {
      expect(registry.has(config.key), `${config.key} 应在注册表内`).toBe(true)
    }
  })

  it('array 触发器编译扫描路径为主数组元素边界（frameStride 10）', () => {
    for (const config of TANSTACK_CHARTS_STREAM_TRIGGERS) {
      expect(config.frameStride).toBe(10)
      const array = config.sections.find(
        (s): s is ArraySectionConfig => s.kind === 'array',
      )
      if (array) expect(array.arrayKey).toBe('data')
    }
  })
})

describe('chart scalar 形态', () => {
  it('key 检出即空壳帧：fallback 保契约（definition 空 marks）', () => {
    const shell = extractorOf().next('{"key":"cx-tanstack-charts-chart"') as CxStreamNode | null
    expect(shell).toMatchObject({
      key: 'cx-tanstack-charts-chart',
      data: { definition: { marks: [] } },
    })
    expect((shell?.data ?? {})['_cx_streaming']).toBeUndefined()
  })

  it('空壳帧经翻译层组装渲染不抛错（fallback 与翻译层默认同值）', () => {
    const shell = extractorOf().next('{"key":"cx-tanstack-charts-chart"') as CxStreamNode
    expect(() =>
      mount(byKey('cx-tanstack-charts-chart'), {
        props: { comp: fakeComp('shell'), ...(shell.data as Record<string, unknown>) },
      }),
    ).not.toThrow()
  })

  it('完整 JSON 终态帧全字段一致（definition 整字段闭合即完整揭示）', () => {
    const data = initialDataOf(byKey('cx-tanstack-charts-chart')._cx_meta)
    const script = JSON.stringify({ id: 'c1', key: 'cx-tanstack-charts-chart', data })
    const final = extractorOf().next(script) as CxStreamNode | null
    expect(final).not.toBeNull()
    expect(final?.data).toMatchObject(data)
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
