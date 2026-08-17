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
 * 形态判定（6 件全 array）：
 * - array 5 件：line/bar/area/dot/pie 预设的 data 是行数组（答复内容主体），
 *   截断点落在行边界逐项揭示（折线逐点生长、饼图逐扇区生长）。
 *   arrayKey 恒为 'data'（单层字段名契约）；props 声明序通道字段（x/y/curve/
 *   name/value/innerRadiusRatio）前置、data 殿后——回放剧本序列化序使增量帧
 *   首行起即携带通道配置，尾随标量（height/ariaLabel）不入增量帧由终帧兜底。
 * - array 1 件：通用 chart 走数据顶层化契约，主数组是顶层 rows（逐行生长）；
 *   definition 序列化在 rows 前，rows 首行闭合时 definition 必然完整——图表
 *   以完整坐标系挂载、数据逐行生长（三段式：骨架→空坐标→行生长）。
 * - 不适用 0 件。计数校验：6 array + 0 scalar + 0 不适用（差集派生兜底）。
 *
 * produced 语义（增量提取器对中间态与终态走同一 buildPartial，实证
 * packages/stream/src/core/incremental.ts Step 5）：
 * - 出帧只由主数组匹配驱动；extraScanPaths（nodes/links）仅提供元素边界
 *   切分点，不驱动出帧——GenUI 契约据此锁死 rows 恒为主数据集在场
 *   （关系型图表 rows=节点行表、links 为边次数据集），无 rows 的 spec 永不
 *   出帧属契约外形态，由生成期校验门拦截。
 * - emptyPassthrough：rows=[] 空数组终态透传节点，由组件空态渲染接管，
 *   防流结束后 pending 永驻。
 *
 * 骨架裁决：不设 skeletonFields——rows 首行闭合即出帧逐行生长，天然有实时
 * 反馈；首行前的 pending 期由渲染管线承担（与预设物料同语义），物料内骨架
 * 判定保留兼容上游 _cx_streaming 注入。
 *
 * fallback 从简：渲染链路不过 zod，包装层无模板直访（useAttrs 平铺 +
 * composable 全回退，缺席不 TypeError）；rows 缺席的中间态经翻译层
 * resolveMarkData 回退空数组，translateChartSpec 组装不抛错（增量帧翻译
 * 实证进包内测试）。
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
    // 通用 chart 走数据顶层化契约：主数组 rows 逐行生长（definition 序列化在先，
    // rows 首行闭合时 definition 必然完整）；nodes/links 关系型数据集为次增长路径
    // （仅提供元素边界切分点，不驱动出帧——契约锁死 rows 恒在场）。
    // emptyPassthrough 覆盖 rows=[] 空态终态透传。空壳骨架由渲染管线 pending 态
    // 承担（与预设物料同语义），物料内骨架判定保留兼容上游 _cx_streaming 注入。
    key: keyOf('cx-chart'),
    sections: [
      {
        kind: 'array',
        arrayKey: 'rows',
        extraScanPaths: [
          ['data', 'nodes', '*'],
          ['data', 'links', '*'],
        ],
      },
    ],
    stateBranch: { emptyPassthrough: true },
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
