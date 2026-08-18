import { colorGradientLegend, colorLegend, defaultChartTheme, defineChart } from '@tanstack/charts'
import { decorative } from '@tanstack/charts/mark/decorative'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { tooltip as domChartTooltip } from '@tanstack/charts/tooltip'

import type { ChartTheme, DomChartDefinition } from '@tanstack/charts'

import { translateAxis } from './axis'
import { COMPOSITE_TYPES, translateCompositeMark } from './composite'
import { translateMark } from './mark'
import { POLAR_FAMILY_TYPES, translatePie, translatePolar } from './polar'
import { applyTransforms } from './transforms'

import type { CxChartDatasets, CxChartMarkSpec, CxChartSpec } from './types'

/**
 * definition 组装：声明式 spec → DomChartDefinition（可直接喂给 <Chart>）。
 *
 * 组装约定：
 * - transforms 管道先于 marks 执行，产物注册进数据集表副本（marks 字符串引用在此解析）
 * - polar 族（polar/pie/sunburst 全为 polar 容器且无直角 channel）未显式声明 x/y 时
 *   置 null 显式无轴（库对 polar mark 的 scale 类型为 never，缺省 axis 注入会抛错）
 * - tree/forceGraph 展开为多 mark；forceGraph 回传的轴域在 x/y 未显式声明时注入
 *   linear scale 实例（仿真坐标以 0 为中心，缺省推断 domain 不包含负半轴余量）
 */

/** color.legend 声明 → 图例实例；true 等价 { kind:'color' } 缺省配置 */
function translateLegend(
  legend: NonNullable<NonNullable<CxChartSpec['color']>['legend']>,
): unknown {
  const options = legend === true ? {} : legend
  const { kind, label, placement, itemWidth, steps, width } = options
  if (kind === 'gradient') {
    const gradient: Record<string, unknown> = {}
    if (label !== undefined) gradient.label = label
    if (placement !== undefined) gradient.placement = placement
    if (steps !== undefined) gradient.steps = steps
    if (width !== undefined) gradient.width = width
    return colorGradientLegend(gradient)
  }
  const items: Record<string, unknown> = {}
  if (label !== undefined) items.label = label
  if (placement !== undefined) items.placement = placement
  if (itemWidth !== undefined) items.itemWidth = itemWidth
  if (width !== undefined) items.width = width
  return colorLegend(items)
}

/**
 * tooltip 声明：false→关闭；true→默认 DOM extension；对象→extension + 标量子集。
 * 库层没有「缺省开启」——resolveTooltipInput 对 undefined 返回 null 即关闭，
 * 开启必须显式挂 extension（裸 extension 或 { use, ...options } 两形态）；
 * 裸 options 对象会在 mount 时抛 TypeError（input.use 为 undefined）。
 */
function translateTooltip(tooltip: NonNullable<CxChartSpec['tooltip']>): unknown {
  if (tooltip === false) return false
  if (tooltip === true) return domChartTooltip
  const options: Record<string, unknown> = {}
  for (const key of [
    'placement',
    'offset',
    'sticky',
    'visibility',
    'anchor',
    'sort',
    'items',
  ] as const) {
    if (tooltip[key] !== undefined) options[key] = tooltip[key]
  }
  return { use: domChartTooltip, ...options }
}

/**
 * 时间轴 channel 纠偏：utc/time scale 要求 channel 值为 Date 实例，而 JSON spec 只能
 * 携带 ISO 字符串——翻译层按轴 scale 声明收集绑定字段，把数据集行映射为 Date 副本
 * （不改写调用方行对象）。null 原样保留（nullable channel 缺口语义）。
 */
function coerceTemporalChannels(spec: CxChartSpec, table: CxChartDatasets): CxChartDatasets {
  const temporal = (axis: CxChartSpec['x']): boolean =>
    axis != null && (axis.scale?.kind === 'utc' || axis.scale?.kind === 'time')
  const xTemporal = temporal(spec.x)
  const yTemporal = temporal(spec.y)
  if (!xTemporal && !yTemporal) return table
  const fieldsByDataset = new Map<string, Set<string>>()
  const bind = (dataRef: unknown, field: unknown) => {
    const name = typeof dataRef === 'string' ? dataRef : 'rows'
    if (typeof field !== 'string') return
    let set = fieldsByDataset.get(name)
    if (!set) fieldsByDataset.set(name, (set = new Set()))
    set.add(field)
  }
  for (const mark of spec.marks) {
    if (xTemporal) for (const f of ['x', 'x1', 'x2'] as const) bind(mark.data, mark[f])
    if (yTemporal) for (const f of ['y', 'y1', 'y2'] as const) bind(mark.data, mark[f])
  }
  let changed = false
  const next: CxChartDatasets = { ...table }
  for (const [name, fields] of fieldsByDataset) {
    const rows = table[name]
    if (!rows?.length) continue
    changed = true
    next[name] = rows.map((row) => {
      if (row == null || typeof row !== 'object') return row
      const source = row as Record<string, unknown>
      const copy = { ...source }
      for (const field of fields) {
        const value = source[field]
        if (typeof value === 'string') copy[field] = new Date(value)
      }
      return copy
    })
  }
  return changed ? next : table
}

/**
 * 单 spec → definition 核心（facet 子 spec 复用）：返回原始 spec 对象而非
 * defineChart 产物——facet chart 回调要求返回 ChartSpec 字面量形态。
 * rowsOverride：facet 分组行注入（子 spec marks 未声明 data 时绑定分组行）。
 */
function buildDefinition(
  spec: CxChartSpec,
  datasets: CxChartDatasets | undefined,
  rowsOverride?: readonly unknown[],
): Record<string, unknown> {
  const base: CxChartDatasets = { ...datasets }
  if (rowsOverride !== undefined) base.rows = rowsOverride
  const transformed = spec.transforms?.length ? applyTransforms(spec.transforms, base) : base
  const table = coerceTemporalChannels(spec, transformed)

  const marks: unknown[] = []
  let derivedXDomain: [number, number] | undefined
  let derivedYDomain: [number, number] | undefined
  let polarOnly = spec.marks.length > 0
  // decorative 声明在统一出口包装：复合 mark 展开多 mark 时父级声明传染全部子 mark
  // （官方用法即整组辅助层装饰化）；facet 子 spec 走递归 buildDefinition 独立判定。
  const pushMark = (specMark: CxChartMarkSpec, runtimeMark: unknown) => {
    marks.push(
      specMark.decorative === true
        ? decorative(runtimeMark as Parameters<typeof decorative>[0])
        : runtimeMark,
    )
  }
  for (const mark of spec.marks) {
    // facet 子 spec：mark 未声明 data 时绑定分组行（顶层 spec 无 rowsOverride，恒 false）
    const bound =
      rowsOverride !== undefined && mark.data === undefined ? { ...mark, data: 'rows' } : mark
    if (!POLAR_FAMILY_TYPES.has(bound.type)) polarOnly = false
    if (bound.type === 'polar') {
      pushMark(bound, translatePolar(bound, table))
    } else if (bound.type === 'pie') {
      pushMark(bound, translatePie(bound, table))
    } else if (COMPOSITE_TYPES.has(bound.type)) {
      // 子 spec 继承本层数据集表（table 已含 transforms 产物）：facet 分组行仅经
      // rowsOverride 覆盖 rows 键，子图显式命名引用（如 geoShape 的 sphere/land
      // 外部轮廓数据）仍可命中顶层表——官方 facet 子图引用外部数据是合法形态。
      const result = translateCompositeMark(bound, table, (child, rows) =>
        buildDefinition(child, table, rows),
      )
      for (const expanded of result.marks) pushMark(bound, expanded)
      if (result.xDomain) derivedXDomain = result.xDomain
      if (result.yDomain) derivedYDomain = result.yDomain
    } else {
      pushMark(bound, translateMark(bound, table))
    }
  }

  const theme: ChartTheme = { ...defaultChartTheme, ...spec.theme }
  const definition: Record<string, unknown> = { marks, theme }

  // polar 族无轴约定：全 polar 容器且未显式声明时显式置 null（显式声明优先，如混合场景）
  const xSpec = spec.x === undefined && polarOnly ? null : spec.x
  const ySpec = spec.y === undefined && polarOnly ? null : spec.y
  const x = translateAxis(xSpec ?? undefined, 'point')
  const y = translateAxis(ySpec ?? undefined, 'linear')
  if (xSpec !== null && x) definition.x = x
  if (xSpec === null) definition.x = null
  if (ySpec !== null && y) definition.y = y
  if (ySpec === null) definition.y = null

  // forceGraph 轴域推导：x/y 未显式声明 scale domain 时注入 linear 实例
  if (derivedXDomain && spec.x?.scale?.domain === undefined) {
    definition.x = { ...(definition.x as Record<string, unknown> | null), scale: scaleLinear().domain(derivedXDomain) }
  }
  if (derivedYDomain && spec.y?.scale?.domain === undefined) {
    definition.y = { ...(definition.y as Record<string, unknown> | null), scale: scaleLinear().domain(derivedYDomain) }
  }

  if (spec.margin !== undefined) definition.margin = spec.margin
  // polar 族未声明 guides 时缺省关闭（官方 polar 示例契约：径向网格由 polarGuides 承担）
  if (spec.guides !== undefined) definition.guides = spec.guides
  else if (polarOnly) definition.guides = false
  if (spec.clip !== undefined) definition.clip = spec.clip
  if (spec.color !== undefined) {
    const color: Record<string, unknown> = {}
    if (spec.color.domain !== undefined) color.domain = spec.color.domain
    if (spec.color.range !== undefined) color.range = spec.color.range
    if (spec.color.legend !== undefined) color.legend = translateLegend(spec.color.legend)
    definition.color = color
  }
  if (spec.pointer !== undefined) definition.pointer = spec.pointer
  if (spec.keyboard !== undefined) definition.keyboard = spec.keyboard
  if (spec.focusRing !== undefined) definition.focusRing = spec.focusRing
  if (spec.focus !== undefined) definition.focus = spec.focus
  // tooltip 缺省开启对齐官方 catalog 形态（官网图表恒有 tooltip，而 LLM 产
  // spec 极少显式配置；库层 undefined=关闭，故缺省显式挂默认 extension，
  // 显式 false 保留关闭逃生）
  const tooltip = spec.tooltip === undefined ? domChartTooltip : translateTooltip(spec.tooltip)
  if (tooltip !== undefined) definition.tooltip = tooltip
  return definition
}

/**
 * 声明式 spec → DomChartDefinition（物料渲染入口）。
 * datasets：命名数据集表（数据顶层化契约），marks 内字符串引用在此解析。
 */
export function translateChartSpec(
  spec: CxChartSpec,
  datasets?: CxChartDatasets,
): DomChartDefinition {
  return (defineChart as unknown as (definition: unknown) => DomChartDefinition)(
    buildDefinition(spec, datasets),
  )
}
