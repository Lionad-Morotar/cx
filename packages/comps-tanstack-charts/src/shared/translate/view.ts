import { viewGrid } from '@tanstack/charts/view'

import type { CxChartDatasets, CxChartSpec, CxChartViewGridSpec } from './types'

/**
 * viewGrid 多视图组合：spec.views → 官方 viewGrid（命名视图 + 网格轨道 + 轴链接）。
 *
 * 权属分界（官方 assertChildDefinition 契约）：子 view 保留 marks/scales/guides/
 * margin/color/clip；host 字段（tooltip/keyboard/pointer/focus/focusRing/motion/
 * gradients/theme.background）只能由外层组合定义持有，子 view 携带即被库拒绝。
 * 子 view 经 buildChild 以 child 模式递归构建（剥除 host 字段，见 definition.ts）；
 * 顶层 host 字段（theme 合并、tooltip 缺省注入）由 applyHost 施加于组合产物。
 * hooks 回调注入保持依赖单向（definition.ts → view.ts，同 composite 先例）。
 */
export interface CxChartViewGridHooks {
  buildChild: (child: CxChartSpec, datasets: CxChartDatasets | undefined) => unknown
  applyHost: (composed: Record<string, unknown>, spec: CxChartSpec) => Record<string, unknown>
}

export function translateViewGrid(
  spec: CxChartSpec,
  datasets: CxChartDatasets | undefined,
  hooks: CxChartViewGridHooks,
): Record<string, unknown> {
  const grid = spec.views as CxChartViewGridSpec
  const views = grid.items.map((item) => {
    if (item.chart.views !== undefined) {
      throw new Error(`translateViewGrid: 子视图 "${item.id}" 不支持嵌套 views`)
    }
    return {
      id: item.id,
      row: item.row,
      column: item.column,
      ...(item.share ? { share: item.share } : {}),
      ...(item.align ? { align: item.align } : {}),
      chart: hooks.buildChild(item.chart, datasets),
    }
  })
  const composed = viewGrid({
    rows: grid.rows,
    columns: grid.columns,
    ...(grid.gap !== undefined ? { gap: grid.gap } : {}),
    ...(grid.rowGap !== undefined ? { rowGap: grid.rowGap } : {}),
    ...(grid.columnGap !== undefined ? { columnGap: grid.columnGap } : {}),
    views,
  } as never) as unknown as Record<string, unknown>
  return hooks.applyHost(composed, spec)
}
