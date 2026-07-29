import def from './index'

import type { ArrayTriggerConfig } from '@lionad/cx-stream'

/**
 * 表格流式增量规则。
 * 主数组为行数据 data.data；列定义 data.columns 为次增长路径。
 * 物料定义中 data 排在 columns 之前，行数据流式期间列定义尚未传输——
 * 与 chart 的 xKey/series 同一尾随场景，从首行键推导 accessorKey/header
 * 兜底（真实列定义已传输则 ??= 语义不覆盖）。
 */
function deriveTableTailFields(completeRows: unknown[]): Record<string, unknown> {
  const first = completeRows[0]
  if (!first || typeof first !== 'object') return {}
  return {
    columns: Object.keys(first as Record<string, unknown>).map((key) => ({
      accessorKey: key,
      header: key,
    })),
  }
}

const config: ArrayTriggerConfig = {
  key: def._cx_meta.key,
  arrayKey: 'data',
  extraScanPaths: [['data', 'columns', '*']],
  deriveTailFields: deriveTableTailFields,
}

export default config
