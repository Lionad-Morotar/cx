import { compileTrigger, createTriggerRegistry } from '@lionad/cx-stream'

import CxTanstackChartsChart from './chart'
import CxTanstackChartsLine from './line'
import CxTanstackChartsBar from './bar'
import CxTanstackChartsArea from './area'
import CxTanstackChartsDot from './dot'
import CxTanstackChartsPie from './pie'

import type { CxSpec, StreamTriggerConfig, TriggerRegistry } from '@lionad/cx-stream'

/**
 * TanStack Charts 物料流式增量配置：6 件全适用——数组增长型 5 件 + 标量主体 1 件。
 *
 * 形态判定（6 件逐件）：
 * - array 5 件：line/bar/area/dot/pie 预设的 data 是行数组（答复内容主体），
 *   截断点落在行边界逐项揭示（折线逐点生长、饼图逐扇区生长）。
 *   arrayKey 恒为 'data'（单层字段名契约）；props 声明序通道字段（x/y/curve/
 *   name/value/innerRadiusRatio）前置、data 殿后——回放剧本序列化序使增量帧
 *   首行起即携带通道配置，尾随标量（height/ariaLabel）不入增量帧由终帧兜底。
 * - scalar 1 件：通用 chart 的 definition 是对象主体。其内 marks 数组位于
 *   二层（data.definition.marks），arrayKey 单层契约不可达；scalar 形态按
 *   compileTrigger 契约独占、不与 array 组合——definition 检出即空壳、整字段
 *   闭合即完整揭示（与 comps 文本物料 content 闭合前空壳同构，接受粒度取舍）。
 * - 不适用 0 件。计数校验：5 + 1 + 0 = 6（playground 判定测试差集派生兜底）。
 *
 * 骨架裁决：整包不设 skeletonFields、不做 wrapper 骨架——props 全带 initial/
 * composable 回退（无可骨架化必填字段，列入会终态常亮），且天然空态在场
 * （空 data 渲染空坐标系、空 marks 渲染空 svg），comps/naive 豁免判例同构。
 *
 * fallback 从简：渲染链路不过 zod，包装层无模板直访（useAttrs 平铺 +
 * composable 全回退，缺席不 TypeError）；chart 的 fallbackData
 * { definition: { marks: [] } } 与翻译层 spec 缺席回退同值，空壳帧经
 * translateChartSpec 组装不抛错（增量帧翻译实证进包内测试）。
 *
 * key 取自物料 meta 原值（keyOf 查询，定义缺失即显式抛错）。
 */

const ALL_MATERIALS = [
  CxTanstackChartsChart,
  CxTanstackChartsLine,
  CxTanstackChartsBar,
  CxTanstackChartsArea,
  CxTanstackChartsDot,
  CxTanstackChartsPie,
]

type Keyed = { _cx_meta: { key: string } }

function keyOf(key: string): string {
  const comp = (ALL_MATERIALS as Keyed[]).find((c) => c._cx_meta?.key === key)
  if (!comp) throw new Error(`tanstack-charts 物料定义缺失: ${key}`)
  return comp._cx_meta.key
}

const ARRAY_PRESET_KEYS = [
  'cx-tanstack-charts-line',
  'cx-tanstack-charts-bar',
  'cx-tanstack-charts-area',
  'cx-tanstack-charts-dot',
  'cx-tanstack-charts-pie',
] as const

export const TANSTACK_CHARTS_STREAM_TRIGGERS: StreamTriggerConfig[] = [
  {
    key: keyOf('cx-tanstack-charts-chart'),
    sections: [{ kind: 'scalar', fallbackData: { definition: { marks: [] } } }],
    frameStride: 10,
  },
  ...ARRAY_PRESET_KEYS.map(
    (key): StreamTriggerConfig => ({
      key: keyOf(key),
      sections: [{ kind: 'array', arrayKey: 'data' }],
      frameStride: 10,
    }),
  ),
]

/** 装配 TanStack Charts 物料的 trigger 注册表（size 恒 6） */
export function createTanstackChartsTriggerRegistry(): TriggerRegistry<CxSpec> {
  const registry = createTriggerRegistry<CxSpec>()
  for (const config of TANSTACK_CHARTS_STREAM_TRIGGERS) {
    registry.register(config.key, compileTrigger(config))
  }
  return registry
}

/** 增量节点的主数组（回放计数展示用）；非数组增长型物料或数组缺席时返回 null */
export function mainArrayOf(node: {
  key: string
  data?: Record<string, unknown>
}): unknown[] | null {
  const config = TANSTACK_CHARTS_STREAM_TRIGGERS.find((c) => c.key === node.key)
  const section = config?.sections.find((s) => s.kind === 'array')
  if (!section || section.kind !== 'array') return null
  const arr = node.data?.[section.arrayKey]
  return Array.isArray(arr) ? arr : null
}
