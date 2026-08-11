import {
  areaX,
  areaY,
  barX,
  barY,
  bandX,
  bandY,
  cell,
  d3Curve,
  defaultChartTheme,
  defineChart,
  dot,
  lineX,
  lineY,
  rect,
  ruleX,
  ruleY,
  text,
  tickX,
  tickY,
} from '@tanstack/charts'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { scaleOrdinal } from '@tanstack/charts/scales/ordinal'
import { scalePoint } from '@tanstack/charts/scales/point'
import { scaleBand } from '@tanstack/charts/scales/band'
import {
  curveBasis,
  curveLinear,
  curveMonotoneX,
  curveNatural,
  curveStep,
  curveStepAfter,
  curveStepBefore,
} from 'd3-shape'

import type {
  ChartAxisOptions,
  ChartCurve,
  ChartMark,
  ChartTheme,
  DomChartDefinition,
} from '@tanstack/charts'
import type { CurveFactory } from 'd3-shape'

/**
 * 声明式 JSON → TanStack Charts 运行时定义的翻译层。
 *
 * Why 存在：defineChart 的 definition 含三类不可 JSON 化值——scale（函数工厂/实例）、
 * curve（ChartCurve 函数对）、回调（format/accessor/tooltip content）。cx 物料 data 必须
 * 纯 JSON，本层把声明式描述（kind 枚举、curve 枚举、字段名 channel、标量子集）编译为
 * 运行时实例。channel 仅支持字段名字符串：低代码与 LLM 生成场景不要求 accessor 函数。
 */

// ---------- 声明式 JSON 类型（物料 data 的投影形态） ----------

export type CxChartCurveName =
  | 'linear'
  | 'monotoneX'
  | 'step'
  | 'stepAfter'
  | 'stepBefore'
  | 'basis'
  | 'natural'

export type CxChartScaleSpec =
  | { kind: 'linear'; domain?: [number, number] }
  | { kind: 'point'; domain?: string[]; padding?: number }
  | { kind: 'band'; domain?: string[]; padding?: number }
  | { kind: 'ordinal'; domain?: string[] }

export interface CxChartAxisSpec {
  scale?: CxChartScaleSpec
  nice?: boolean | number
  reverse?: boolean
  grid?: boolean
  axis?:
    | false
    | {
        label?: string
        ticks?: { count?: number; size?: number; padding?: number; values?: (number | string)[] }
        tickLabels?:
          | false
          | {
              rotate?: number
              fontSize?: number
              dx?: number
              dy?: number
              anchor?: 'start' | 'middle' | 'end'
            }
      }
}

export type CxChartMarkType =
  | 'lineY'
  | 'lineX'
  | 'areaY'
  | 'areaX'
  | 'barY'
  | 'barX'
  | 'ruleY'
  | 'ruleX'
  | 'dot'
  | 'text'
  | 'tickX'
  | 'tickY'
  | 'bandY'
  | 'bandX'
  | 'rect'
  | 'cell'

export interface CxChartMarkSpec {
  type: CxChartMarkType
  /** 行数组或常量数组（rule 类），原样透传给 mark 工厂 */
  data?: readonly unknown[]
  id?: string
  x?: string
  y?: string
  x1?: string
  x2?: string
  y1?: string
  y2?: string
  z?: string
  color?: string
  key?: string
  text?: string
  r?: string | number
  stroke?: string
  strokeWidth?: number
  strokeOpacity?: number
  strokeDasharray?: string
  fill?: string
  fillOpacity?: number
  curve?: CxChartCurveName
  fontSize?: number
  fontWeight?: number
  dx?: number
  dy?: number
  points?: boolean
}

export interface CxChartSpec {
  marks: CxChartMarkSpec[]
  x?: CxChartAxisSpec | null
  y?: CxChartAxisSpec | null
  theme?: Partial<ChartTheme>
  margin?: number | { top?: number; right?: number; bottom?: number; left?: number }
  guides?: boolean
  clip?: boolean
  tooltip?:
    | boolean
    | {
        placement?:
          | 'top'
          | 'top-right'
          | 'right'
          | 'bottom-right'
          | 'bottom'
          | 'bottom-left'
          | 'left'
          | 'top-left'
        offset?: number
        sticky?: boolean
        visibility?: 'focus' | 'pinned'
      }
  pointer?: boolean
  keyboard?: boolean
  focusRing?: boolean
}

// ---------- curve 翻译 ----------

const CURVE_FACTORIES: Record<CxChartCurveName, CurveFactory> = {
  linear: curveLinear,
  monotoneX: curveMonotoneX,
  step: curveStep,
  stepAfter: curveStepAfter,
  stepBefore: curveStepBefore,
  basis: curveBasis,
  natural: curveNatural,
}

/** curve 枚举 → ChartCurve；未知枚举显式抛错（JSON 输入不受 TS 约束，运行时防御） */
export function translateCurve(name: CxChartCurveName): ChartCurve {
  const factory = CURVE_FACTORIES[name]
  if (!factory) {
    throw new Error(`translateCurve: 未知 curve 枚举 "${String(name)}"`)
  }
  return d3Curve(factory)
}

// ---------- scale 翻译 ----------

/**
 * scale 声明式 → ChartScaleInput。
 * 无 domain 时返回工厂形态（库从 marks channel 推断 domain）；
 * 有 domain 时返回实例（保留配置，库不再推断）。
 */
export function translateScale(spec: CxChartScaleSpec): unknown {
  switch (spec.kind) {
    case 'linear':
      return spec.domain ? scaleLinear().domain(spec.domain) : scaleLinear
    case 'point': {
      if (spec.domain) {
        const instance = scalePoint<string>().domain(spec.domain)
        return spec.padding === undefined ? instance : instance.padding(spec.padding)
      }
      return () => (spec.padding === undefined ? scalePoint() : scalePoint().padding(spec.padding))
    }
    case 'band': {
      if (spec.domain) {
        const instance = scaleBand<string>().domain(spec.domain)
        return spec.padding === undefined ? instance : instance.padding(spec.padding)
      }
      return () => (spec.padding === undefined ? scaleBand() : scaleBand().padding(spec.padding))
    }
    case 'ordinal':
      return spec.domain ? scaleOrdinal<string>().domain(spec.domain) : scaleOrdinal
    default:
      throw new Error(`translateScale: 未知 scale kind "${String((spec as { kind: string }).kind)}"`)
  }
}

// ---------- mark 翻译 ----------

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
} as const

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
  if (spec.r !== undefined && typeof spec.r !== 'string' && typeof spec.r !== 'number') {
    throw new Error(`translateMark: channel "r" 只支持字段名或数值，收到 ${typeof spec.r}`)
  }
}

/** 单 mark 声明式 → ChartMark；多余样式键对 mark 工厂无害（按名读取） */
export function translateMark(spec: CxChartMarkSpec): ChartMark<unknown, any, any> {
  const factory = MARK_FACTORIES[spec.type]
  if (!factory) {
    throw new Error(`translateMark: 未知 mark type "${String(spec.type)}"`)
  }
  assertChannels(spec)
  const options: Record<string, unknown> = {}
  for (const key of CHANNEL_KEYS) {
    if (spec[key] !== undefined) options[key] = spec[key]
  }
  for (const key of STYLE_KEYS) {
    if (spec[key] !== undefined) options[key] = spec[key]
  }
  if (spec.r !== undefined) options.r = spec.r
  if (spec.id !== undefined) options.id = spec.id
  if (spec.curve !== undefined) options.curve = translateCurve(spec.curve)
  return (factory as (data: readonly unknown[], options: Record<string, unknown>) => ChartMark<unknown, any, any>)(
    spec.data ?? [],
    options,
  )
}

// ---------- axis 翻译 ----------

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
 * null/undefined 原样保留（polar 等 scale 值为 never 的 definition 省略 x/y）。
 */
export function translateAxis(
  spec: CxChartAxisSpec | null | undefined,
  fallbackKind: 'point' | 'linear',
): ChartAxisOptions | null | undefined {
  if (spec === null || spec === undefined) return spec
  const scale = spec.scale
    ? translateScale(spec.scale)
    : fallbackKind === 'point'
      ? () => scalePoint()
      : scaleLinear
  const axis: ChartAxisOptions = { scale: scale as ChartAxisOptions['scale'] }
  if (spec.nice !== undefined) axis.nice = spec.nice
  if (spec.reverse !== undefined) axis.reverse = spec.reverse
  if (spec.grid !== undefined) axis.grid = spec.grid
  if (spec.axis !== undefined) axis.axis = translateAxisPresentation(spec.axis)
  return axis
}

// ---------- definition 组装 ----------

/**
 * 声明式 spec → DomChartDefinition（可直接喂给 <Chart>）。
 * theme 与默认主题合并为完整 ChartTheme（palette 等字段缺省有库默认回退值）。
 */
export function translateChartSpec(spec: CxChartSpec): DomChartDefinition {
  const marks = spec.marks.map(translateMark)
  const theme: ChartTheme = { ...defaultChartTheme, ...spec.theme }
  const definition: Record<string, unknown> = {
    marks,
    theme,
  }
  const x = translateAxis(spec.x, 'point')
  const y = translateAxis(spec.y, 'linear')
  if (x !== undefined) definition.x = x
  if (y !== undefined) definition.y = y
  if (spec.margin !== undefined) definition.margin = spec.margin
  if (spec.guides !== undefined) definition.guides = spec.guides
  if (spec.clip !== undefined) definition.clip = spec.clip
  if (spec.pointer !== undefined) definition.pointer = spec.pointer
  if (spec.keyboard !== undefined) definition.keyboard = spec.keyboard
  if (spec.focusRing !== undefined) definition.focusRing = spec.focusRing
  if (spec.tooltip !== undefined) {
    definition.tooltip = spec.tooltip === true ? undefined : spec.tooltip === false ? false : spec.tooltip
  }
  return (defineChart as (definition: unknown) => DomChartDefinition)(definition)
}
