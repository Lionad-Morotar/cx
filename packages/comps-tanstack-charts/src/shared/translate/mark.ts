import {
  areaX,
  areaY,
  arrow,
  barX,
  barY,
  bandX,
  bandY,
  boxX,
  boxY,
  cell,
  differenceX,
  differenceY,
  dodgeX,
  dodgeY,
  dot,
  frame,
  group,
  hexagon,
  lineX,
  lineY,
  linearRegressionX,
  linearRegressionY,
  link,
  rect,
  ridgelineX,
  ridgelineY,
  ruleX,
  ruleY,
  stack,
  text,
  tickX,
  tickY,
  vector,
  violinX,
  violinY,
  waffleX,
  waffleY,
} from '@tanstack/charts'

import type { ChartMark } from '@tanstack/charts'

import { contour } from '@tanstack/charts/spatial/contour'
import { delaunayLink } from '@tanstack/charts/spatial/delaunay'
import { hexbin } from '@tanstack/charts/spatial/hexbin'
import { voronoi } from '@tanstack/charts/spatial/voronoi'

import { translateCurve } from './curve'
import { translateOutputs } from './transforms'

import type { CxChartDatasets, CxChartLayoutSpec, CxChartMarkSpec } from './types'

/** 字段名 channel 白名单（运行时校验只接受字符串；accessor 函数 JSON 不可表达） */
const CHANNEL_KEYS = [
  'x',
  'y',
  'x1',
  'x2',
  'y1',
  'y2',
  'z',
  'color',
  'key',
  'text',
] as const

/** 弹性 channel（字段名字符串或数值常量：radial 的 angle/radius、violin 的 width 等） */
const CHANNEL_FLEX_KEYS = ['r', 'angle', 'radius', 'width', 'height', 'length', 'rotate'] as const

/** 通用样式键（原样透传，多余键对 mark 工厂无害——按名读取） */
const STYLE_KEYS = [
  'stroke',
  'strokeWidth',
  'strokeOpacity',
  'strokeDasharray',
  'fill',
  'fillOpacity',
  'fontSize',
  'fontWeight',
  'dx',
  'dy',
  'points',
  'opacity',
] as const

/** mark 专有标量选项（原样透传；枚举合法性由库运行时与生成期校验门双重兜底） */
const SCALAR_KEYS = [
  'span',
  'overlap',
  'unit',
  'round',
  'gap',
  'columns',
  'headLength',
  'headAngle',
  'lineCap',
  'anchor',
  'ci',
  'samples',
  'positiveFill',
  'negativeFill',
  'positiveFillOpacity',
  'negativeFillOpacity',
  'comparisonStroke',
  'cornerRadius',
  'padAngle',
  'radiusOffset',
  'baseline',
  'inset',
] as const

const MARK_FACTORIES = {
  lineY,
  lineX,
  areaY,
  areaX,
  barY,
  barX,
  ruleY,
  ruleX,
  dot,
  text,
  tickX,
  tickY,
  bandY,
  bandX,
  rect,
  cell,
  link,
  arrow,
  vector,
  hexagon,
  boxY,
  boxX,
  violinY,
  violinX,
  ridgelineY,
  ridgelineX,
  waffleY,
  waffleX,
  differenceY,
  differenceX,
  linearRegressionY,
  linearRegressionX,
} as const

/**
 * spatial 系 mark 工厂（子路径导入，签名与主入口 mark 同构：(source, options)）。
 * contour 是网格数据等值线（无 x/y channel，width/height 为网格行列数）。
 */
const SPATIAL_FACTORIES = {
  voronoi,
  hexbin,
  contour,
  delaunayLink,
} as const

/** frame 无数据形态（纯装饰 mark）：签名无 source 参数，特判不走数据解析 */
function translateFrame(spec: CxChartMarkSpec): ChartMark<unknown, any, any> {
  const options: Record<string, unknown> = {}
  for (const key of ['fill', 'stroke', 'fillOpacity', 'strokeOpacity', 'strokeWidth', 'inset', 'radius'] as const) {
    if (spec[key] !== undefined) options[key] = spec[key]
  }
  return frame(options) as ChartMark<unknown, any, any>
}

/** channel 运行时校验：只接受字段名字符串（accessor 函数 JSON 不可表达） */
function assertChannels(spec: CxChartMarkSpec): void {
  for (const key of CHANNEL_KEYS) {
    const value = spec[key]
    if (value !== undefined && typeof value !== 'string') {
      throw new Error(
        `translateMark: channel "${key}" 只支持字段名字符串，收到 ${typeof value}（mark type=${spec.type}）`,
      )
    }
  }
  for (const key of CHANNEL_FLEX_KEYS) {
    const value = spec[key]
    if (value !== undefined && typeof value !== 'string' && typeof value !== 'number') {
      throw new Error(`translateMark: channel "${key}" 只支持字段名或数值，收到 ${typeof value}`)
    }
  }
}

/**
 * mark data 解析：字符串 → datasets 查表；数组原样透传。
 * 未命中一律回退空数组——流式中间态（definition 先闭合、数据集在途；多数据集
 * 部分到达）与 LLM 笔误在运行时不可区分，渲染层容错优先（与「渲染链路不过 zod，
 * fallback 从简」契约一致）；笔误显式化归生成期校验（spec 渲染断言门）。
 */
export function resolveMarkData(
  data: readonly unknown[] | string | undefined,
  datasets: CxChartDatasets | undefined,
): readonly unknown[] {
  if (data === undefined) return []
  if (typeof data !== 'string') return data
  return datasets?.[data] ?? []
}

/** layout 声明式 → mark layout 工厂（stack/group/dodge 挂 mark.layout 字段） */
function translateLayout(spec: CxChartLayoutSpec): unknown {
  switch (spec.kind) {
    case 'stack': {
      const options: Record<string, unknown> = {}
      if (spec.order !== undefined) options.order = spec.order
      if (spec.offset !== undefined) options.offset = spec.offset
      if (spec.reverse !== undefined) options.reverse = spec.reverse
      if (spec.anchor !== undefined) options.anchor = spec.anchor
      return stack(options)
    }
    case 'group':
      return group(spec.padding === undefined ? undefined : { padding: spec.padding })
    case 'dodgeX': {
      const options: Record<string, unknown> = {}
      if (spec.anchor !== undefined) options.anchor = spec.anchor
      if (spec.padding !== undefined) options.padding = spec.padding
      return dodgeX(options)
    }
    case 'dodgeY': {
      const options: Record<string, unknown> = {}
      if (spec.anchor !== undefined) options.anchor = spec.anchor
      if (spec.padding !== undefined) options.padding = spec.padding
      return dodgeY(options)
    }
    default:
      throw new Error(
        `translateLayout: 未知 layout kind "${String((spec as { kind: string }).kind)}"`,
      )
  }
}

/** spatial 专有标量（hexbin 的 binWidth/outputs、contour 的 thresholds/smooth）按存在性透传 */
function translateSpatialMark(
  spec: CxChartMarkSpec,
  datasets: CxChartDatasets | undefined,
): ChartMark<unknown, any, any> {
  const factory = SPATIAL_FACTORIES[spec.type as keyof typeof SPATIAL_FACTORIES]
  if (!factory) {
    throw new Error(`translateSpatialMark: 未知 spatial mark type "${String(spec.type)}"`)
  }
  assertChannels(spec)
  const options: Record<string, unknown> = {}
  for (const key of CHANNEL_KEYS) {
    if (spec[key] !== undefined) options[key] = spec[key]
  }
  for (const key of CHANNEL_FLEX_KEYS) {
    if (spec[key] !== undefined) options[key] = spec[key]
  }
  for (const key of STYLE_KEYS) {
    if (spec[key] !== undefined) options[key] = spec[key]
  }
  if (spec.id !== undefined) options.id = spec.id
  if (spec.value !== undefined) options.value = spec.value
  if (spec.binWidth !== undefined) options.binWidth = spec.binWidth
  if (spec.thresholds !== undefined) options.thresholds = spec.thresholds
  if (spec.smooth !== undefined) options.smooth = spec.smooth
  if (spec.outputs !== undefined) options.outputs = translateOutputs(spec.outputs)
  return (
    factory as (
      data: readonly unknown[],
      options: Record<string, unknown>,
    ) => ChartMark<unknown, any, any>
  )(resolveMarkData(spec.data, datasets), options)
}

/**
 * 单 mark 声明式 → ChartMark；多余样式键对 mark 工厂无害（按名读取）。
 * polar/pie/sankey 等容器与复合 type 不在此处（polar.ts / composite.ts 分支处理）。
 */
export function translateMark(
  spec: CxChartMarkSpec,
  datasets?: CxChartDatasets,
): ChartMark<unknown, any, any> {
  if (spec.type === 'frame') return translateFrame(spec)
  if (spec.type in SPATIAL_FACTORIES) return translateSpatialMark(spec, datasets)
  const factory = MARK_FACTORIES[spec.type as keyof typeof MARK_FACTORIES]
  if (!factory) {
    throw new Error(`translateMark: 未知 mark type "${String(spec.type)}"`)
  }
  assertChannels(spec)
  const options: Record<string, unknown> = {}
  for (const key of CHANNEL_KEYS) {
    if (spec[key] !== undefined) options[key] = spec[key]
  }
  for (const key of CHANNEL_FLEX_KEYS) {
    if (spec[key] !== undefined) options[key] = spec[key]
  }
  for (const key of STYLE_KEYS) {
    if (spec[key] !== undefined) options[key] = spec[key]
  }
  for (const key of SCALAR_KEYS) {
    if (spec[key] !== undefined) options[key] = spec[key]
  }
  if (spec.id !== undefined) options.id = spec.id
  if (spec.curve !== undefined) options.curve = translateCurve(spec.curve)
  if (spec.layout !== undefined) options.layout = translateLayout(spec.layout)
  return (
    factory as (
      data: readonly unknown[],
      options: Record<string, unknown>,
    ) => ChartMark<unknown, any, any>
  )(resolveMarkData(spec.data, datasets), options)
}
