import def from './index'

import type { StreamTriggerConfig } from '@lionad/cx-stream'

/**
 * 表格流式增量规则。
 * 主数组为行数据 data.data；列定义 data.columns 为次增长路径。
 * 物料定义中 data 排在 columns 之前，行数据流式期间列定义尚未传输——
 * 与 chart 的 xKey/series 同一尾随场景，从首行键推导 accessorKey/header
 * 兜底（真实列定义已传输则 ??= 语义不覆盖）。
 * 空态分支：行数组闭合且 0 行时透传节点，table 内置 empty slot 接管渲染；
 * 未闭合时保持 lastValid——暂无行可能只是还没传到。
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

const config: StreamTriggerConfig = {
  key: def._cx_meta.key,
  sections: [
    {
      kind: 'array',
      arrayKey: 'data',
      extraScanPaths: [['data', 'columns', '*']],
      deriveTailFields: deriveTableTailFields,
    },
  ],
  stateBranch: { emptyPassthrough: true },
}

export default config
