import {
  angleGrid,
  pie as pieTransform,
  polar,
  radialArc,
  radialArea,
  radialBarAngle,
  radialBarRadius,
  radialDot,
  radialGrid,
  radialLine,
  radialRule,
  radialText,
} from '@tanstack/charts/polar'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { scaleBand } from '@tanstack/charts/scales/band'
import { scalePoint } from '@tanstack/charts/scales/point'

import type { ChartMark } from '@tanstack/charts'

import { translateRadialCurve } from './curve'
import { resolveMarkData } from './mark'
import { translateScale } from './scale'

import type {
  CxChartDatasets,
  CxChartMarkSpec,
  CxChartPolarGuideSpec,
} from './types'

/**
 * polar 嵌套 mark 翻译：polar 是 marks 数组内的容器（非 definition 顶层字段），
 * 子 mark 为 radial 系；官方 PolarLength 的函数形态（({radius}) => radius * r）在
 * JSON 中以 *Ratio 数值表达，翻译层转函数。
 */

const RADIAL_FACTORIES = {
  radialArc,
  radialBarRadius,
  radialBarAngle,
  radialLine,
  radialArea,
  radialDot,
  radialText,
  radialRule,
} as const

/** 比例数值 → PolarLength 函数；undefined 缺省不传（库缺省回退） */
function ratioToLength(ratio: number | undefined): ((context: { radius: number }) => number) | undefined {
  if (ratio === undefined) return undefined
  return ({ radius }) => radius * ratio
}

/** radial 子 mark 声明式 → PolarMark（channel：angle/radius 弹性，样式透传） */
function translateRadialMark(
  spec: CxChartMarkSpec,
  datasets: CxChartDatasets | undefined,
): unknown {
  const factory = RADIAL_FACTORIES[spec.type as keyof typeof RADIAL_FACTORIES]
  if (!factory) {
    throw new Error(`translatePolar: 未知 radial mark type "${String(spec.type)}"`)
  }
  const options: Record<string, unknown> = {}
  for (const key of [
    'angle',
    'angle1',
    'angle2',
    'radius',
    'radius1',
    'radius2',
    'key',
    'z',
    'color',
    'text',
    'startAngle',
    'endAngle',
    'padAngle',
  ] as const) {
    if (spec[key] !== undefined) options[key] = spec[key]
  }
  for (const key of [
    'stroke',
    'strokeWidth',
    'strokeOpacity',
    'strokeDasharray',
    'fill',
    'fillOpacity',
    'fontSize',
    'fontWeight',
    'opacity',
    'cornerRadius',
    'points',
    'r',
    'dx',
    'dy',
    'anchor',
    'baseline',
    'rotate',
    'radiusOffset',
  ] as const) {
    if (spec[key] !== undefined) options[key] = spec[key]
  }
  if (spec.id !== undefined) options.id = spec.id
  // radial 系 curve 参数消费原生 d3 CurveFactory（非 ChartCurve 包装，库签名实证）
  if (spec.curve !== undefined) options.curve = translateRadialCurve(spec.curve)
  if (spec.innerRadiusRatio !== undefined) options.innerRadius = ratioToLength(spec.innerRadiusRatio)
  if (spec.outerRadiusRatio !== undefined) options.outerRadius = ratioToLength(spec.outerRadiusRatio)
  return (factory as (data: readonly unknown[], options: Record<string, unknown>) => unknown)(
    resolveMarkData(spec.data, datasets),
    options,
  )
}

/** polar guides 声明式 → PolarGuide */
function translatePolarGuide(spec: CxChartPolarGuideSpec): unknown {
  const factory = spec.kind === 'radialGrid' ? radialGrid : angleGrid
  const options: Record<string, unknown> = {}
  for (const key of ['values', 'ticks', 'shape', 'labels', 'labelAngle', 'labelOffset'] as const) {
    if (spec[key] !== undefined) options[key] = spec[key]
  }
  return (factory as (options: Record<string, unknown>) => unknown)(options)
}

/** polar axis 声明式（复用 scale 枚举；wrap 仅 angle 轴）→ PolarAngleOptions/PolarRadiusOptions */
function translatePolarAxis(spec: CxChartMarkSpec['angleAxis']): Record<string, unknown> | undefined {
  if (!spec) return undefined
  const axis: Record<string, unknown> = {}
  if (spec.scale) axis.scale = translateScale(spec.scale)
  if (spec.nice !== undefined) axis.nice = spec.nice
  return axis
}

/**
 * polar 容器：{ type:'polar', marks:[radialXxx...], angleAxis, radiusAxis, radiusRatio,
 * startAngle, endAngle, inset, polarGuides } → polar({...})。
 * extraMarks：调用方预组装的 PolarMark（sunburst 等自包含层级 mark 不走 radial 直译）。
 */
export function translatePolar(
  spec: CxChartMarkSpec,
  datasets: CxChartDatasets | undefined,
  extraMarks: readonly unknown[] = [],
): ChartMark<unknown, any, any> {
  const marks = [
    ...(spec.marks ?? []).map((m) => translateRadialMark(m, datasets)),
    ...extraMarks,
  ]
  const options: Record<string, unknown> = { marks }
  if (spec.radiusRatio !== undefined) options.radiusRatio = spec.radiusRatio
  if (spec.startAngle !== undefined) options.startAngle = spec.startAngle
  if (spec.endAngle !== undefined) options.endAngle = spec.endAngle
  if (spec.inset !== undefined) options.inset = spec.inset
  if (spec.id !== undefined) options.id = spec.id
  const angle = translatePolarAxis(spec.angleAxis)
  const radius = translatePolarAxis(spec.radiusAxis)
  // 未声明时注入缺省 scale：radialBar 系要求 band（需 bandwidth）——radialBarRadius
  // 的 angle 为类别、radialBarAngle 的 radius 为类别；按子 mark 构成分别注入。
  // 缺省注入同时兜底流式中间态（angleAxis/radiusAxis 字段尚未传到）。
  // radialArc/sunburst 走原始弧度不消费 scale，注入对其无害（官方 donut 示例实证）。
  const hasRadialBarRadius = (spec.marks ?? []).some((m) => m.type === 'radialBarRadius')
  const hasRadialBarAngle = (spec.marks ?? []).some((m) => m.type === 'radialBarAngle')
  options.angle = angle ?? { scale: () => (hasRadialBarRadius ? scaleBand() : scalePoint()) }
  options.radius = radius ?? { scale: hasRadialBarAngle ? () => scaleBand() : scaleLinear }
  if (spec.polarGuides?.length) options.guides = spec.polarGuides.map(translatePolarGuide)
  return polar(options as never) as ChartMark<unknown, any, any>
}

/**
 * pie 命名复合：{ type:'pie', data, value, key, color, innerRadiusRatio, ... } →
 * pie() 角度分配预处理 + polar(radialArc) 一体展开（donut = innerRadiusRatio > 0）。
 * startAngle/endAngle/padAngle 并入 transform options（transform 侧字段名 gapAngle；
 * 容器层同名字段只作用于 angle scale 映射，radialArc 直接读 datum 弧度——
 * 不传 transform 则声明静默失效）。返回 polar 容器 mark，definition 层按 polar 族
 * 约定处理无轴（见 definition.ts）。
 */
export function translatePie(
  spec: CxChartMarkSpec,
  datasets: CxChartDatasets | undefined,
): ChartMark<unknown, any, any> {
  const rows = resolveMarkData(spec.data, datasets)
  if (!spec.value) throw new Error('translatePie: pie 复合 mark 必须有 value 字段')
  const transformOptions: Record<string, unknown> = { value: spec.value }
  if (spec.padAngle !== undefined) transformOptions.gapAngle = spec.padAngle
  if (spec.startAngle !== undefined) transformOptions.startAngle = spec.startAngle
  if (spec.endAngle !== undefined) transformOptions.endAngle = spec.endAngle
  const slices = (pieTransform as (source: readonly unknown[], options: unknown) => readonly unknown[])(
    rows,
    transformOptions,
  )
  const arc: CxChartMarkSpec = {
    type: 'radialArc',
    data: slices as readonly unknown[],
    key: spec.key,
    color: spec.color,
    cornerRadius: spec.cornerRadius,
    innerRadiusRatio: spec.innerRadiusRatio,
    outerRadiusRatio: spec.outerRadiusRatio,
    stroke: spec.stroke,
    strokeWidth: spec.strokeWidth,
    fillOpacity: spec.fillOpacity,
    opacity: spec.opacity,
  }
  const polarSpec: CxChartMarkSpec = {
    type: 'polar',
    marks: [arc],
    radiusRatio: spec.radiusRatio,
    inset: spec.inset,
    polarGuides: spec.polarGuides,
  }
  return translatePolar(polarSpec, datasets)
}

/** polar 族 type 判定（definition 组装层据此应用无轴约定） */
export const POLAR_FAMILY_TYPES: ReadonlySet<string> = new Set(['polar', 'pie', 'sunburst'])
