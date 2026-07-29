import def from './index'

import type { ArrayTriggerConfig } from '@lionad/cx-stream'

/**
 * 与生成侧转译器同一语义：首字段作 xKey，其余字段作 series。
 * 图表的 xKey/series 序列化在数据数组之后，数据点流式期间缺席，
 * 用已完整传输的行推导补齐（真实字段已传输则 ??= 不覆盖）。
 */
function deriveChartTailFields(completeRows: unknown[]): Record<string, unknown> {
  const first = completeRows[0]
  if (!first || typeof first !== 'object') return {}
  const keys = Object.keys(first as Record<string, unknown>)
  return {
    xKey: keys[0],
    series: keys.slice(1).map((k) => ({ key: k, label: k })),
  }
}

/** 图表流式增量规则：主数组为数据点 data.data，系列定义 data.series 为次增长路径 */
const config: ArrayTriggerConfig = {
  key: def._cx_meta.key,
  arrayKey: 'data',
  extraScanPaths: [['data', 'series', '*']],
  deriveTailFields: deriveChartTailFields,
}

export default config
