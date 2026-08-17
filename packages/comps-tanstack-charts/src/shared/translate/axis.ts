import { scalePoint } from '@tanstack/charts/scales/point'
import { scaleLinear } from '@tanstack/charts/scales/linear'

import type { ChartAxisOptions } from '@tanstack/charts'

import { translateScale } from './scale'

import type { CxChartAxisSpec } from './types'

function translateAxisPresentation(
  axis: NonNullable<CxChartAxisSpec['axis']>,
): NonNullable<ChartAxisOptions['axis']> {
  if (axis === false) return false
  const presentation: Record<string, unknown> = {}
  if (axis.label !== undefined) presentation.label = axis.label
  if (axis.ticks !== undefined) {
    const ticks: Record<string, unknown> = {}
    if (axis.ticks.count !== undefined) ticks.count = axis.ticks.count
    if (axis.ticks.size !== undefined) ticks.size = axis.ticks.size
    if (axis.ticks.padding !== undefined) ticks.padding = axis.ticks.padding
    if (axis.ticks.values !== undefined) ticks.values = axis.ticks.values
    presentation.ticks = ticks
  }
  if (axis.tickLabels !== undefined) presentation.tickLabels = axis.tickLabels
  return presentation as NonNullable<ChartAxisOptions['axis']>
}

/**
 * axis 声明式 → ChartAxisOptions；scale 缺省按轴位回退（x→point、y→linear）。
 * undefined（含流式中间态：definition 开容器后 x/y 字段尚未传到）注入缺省 axis——
 * 库对「mark 物化 channel 但 axis 无 scale 配置」抛错，缺席不等于无轴。
 * null 原样保留（polar 等 scale 值为 never 的 definition 显式无轴）。
 */
export function translateAxis(
  spec: CxChartAxisSpec | null | undefined,
  fallbackKind: 'point' | 'linear',
): ChartAxisOptions | null {
  if (spec === null) return null
  const scale = spec?.scale
    ? translateScale(spec.scale)
    : fallbackKind === 'point'
      ? () => scalePoint()
      : scaleLinear
  const axis: ChartAxisOptions = { scale: scale as ChartAxisOptions['scale'] }
  if (spec?.nice !== undefined) axis.nice = spec.nice
  if (spec?.reverse !== undefined) axis.reverse = spec.reverse
  if (spec?.grid !== undefined) axis.grid = spec.grid
  if (spec?.axis !== undefined) axis.axis = translateAxisPresentation(spec.axis)
  return axis
}
