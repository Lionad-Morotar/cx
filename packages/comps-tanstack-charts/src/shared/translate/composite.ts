import { dot, link, rect } from '@tanstack/charts'
import { facet } from '@tanstack/charts/facet'
import { geoShape } from '@tanstack/charts/geo'
import { sunburst } from '@tanstack/charts/hierarchy/sunburst'
import { treeLayout } from '@tanstack/charts/hierarchy/tree'
import { treemap } from '@tanstack/charts/hierarchy/treemap'
import { forceLayout } from '@tanstack/charts/network/force'
import { sankeyDiagram } from '@tanstack/charts/network/sankey'
import {
  geoAlbersUsa,
  geoEqualEarth,
  geoIdentity,
  geoMercator,
  geoNaturalEarth1,
  geoOrthographic,
} from 'd3-geo'

import type { ChartMark } from '@tanstack/charts'

import { resolveMarkData, resolveRScaleOption } from './mark'
import { translatePolar } from './polar'

import type {
  CxChartDatasets,
  CxChartForceSpec,
  CxChartMarkSpec,
  CxChartSpec,
} from './types'

/**
 * 复合 mark 翻译：七类命名复合（sankey/sunburst/treemap/tree/forceGraph/geoShape/facet）。
 * 官方 API 三形态各自固化：
 * - 自包含（sunburst/treemap/geoShape）：单调用返回 mark，声明字段按名透传
 * - 布局后回调组装（sankey）：marks 回调固化 link+rect 标准绘制（channel 锁定布局行字段）
 * - 纯布局工具（tree/forceGraph 返回 {nodes,links} 而非 mark）：固化 link+dot 标准绘制
 * facet 的 chart 回调固化为递归子 spec 模板（翻译器由调用方注入，规避循环 import）。
 *
 * 断言桥与 transforms.ts 同源：库泛型按 datum 参数化，Channel<unknown> 不接受字符串
 * 字段名（TransformValue 对 unknown 不协变），统一经 LooseMark 别名桥接。
 */
type LooseMark = (
  data: readonly unknown[],
  options: Record<string, unknown>,
) => ChartMark<unknown, any, any>
const looseLink = link as LooseMark
const looseRect = rect as LooseMark
const looseDot = dot as LooseMark

/**
 * 层级数据源声明：path 模式（delimiter 拆分）或 nodeId/parentId 平铺模式。
 * idKey：库内命名不一致——treeLayout 平铺模式键名是 id，sunburst/treemap 是 nodeId。
 */
function hierarchyOptions(
  spec: CxChartMarkSpec,
  idKey: 'id' | 'nodeId',
): Record<string, unknown> {
  if (spec.path) {
    const options: Record<string, unknown> = { path: spec.path }
    if (spec.delimiter !== undefined) options.delimiter = spec.delimiter
    return options
  }
  if (spec.nodeId && spec.parentId) {
    return { [idKey]: spec.nodeId, parentId: spec.parentId }
  }
  throw new Error(
    `translateComposite: ${spec.type} 层级数据源必须声明 path 或 nodeId+parentId`,
  )
}

/**
 * 层级布局节点的字段名通道（treemap/sunburst 的 color/z、tree 节点 dot 的 color/r）：
 * 库的 channelValues 在布局节点上平查 datum[field]，而 flatHierarchyNodeContext 把源行
 * 收纳在 data 下不展开——字段名物化为 data 取值 accessor，保持「字段名引用源数据」契约。
 * sankey 不在此列：其 marks 回调 channel 按设计锁定布局行字段（key/width 等 canonical）。
 */
function hierarchyFieldChannel(field: string): (node: unknown) => unknown {
  return (node) =>
    (node as { data?: Record<string, unknown> } | null)?.data?.[field]
}

/** sankey：固化 marks 回调 = link(布局连线) + rect(布局节点)，样式取自声明 */
function translateSankey(
  spec: CxChartMarkSpec,
  datasets: CxChartDatasets | undefined,
): ChartMark<unknown, any, any> {
  const nodes = resolveMarkData(spec.nodes, datasets)
  const links = resolveMarkData(spec.links, datasets)
  if (!spec.nodeKey || !spec.source || !spec.target || !spec.value) {
    throw new Error('translateSankey: sankey 必须声明 nodeKey/source/target/value')
  }
  const options: Record<string, unknown> = {
    nodes,
    links,
    nodeKey: spec.nodeKey,
    source: spec.source,
    target: spec.target,
    value: spec.value,
    marks: (context: { nodes: readonly unknown[]; links: readonly unknown[] }) => [
      looseLink(context.links, {
        x1: 'x1',
        y1: 'y1',
        x2: 'x2',
        y2: 'y2',
        // 布局行有 canonical key 字段（原 datum 收纳在 .data 下不展开，官方示例实证）
        key: 'key',
        strokeWidth: 'width',
        lineCap: 'butt',
        stroke: spec.stroke ?? undefined,
        strokeOpacity: spec.strokeOpacity ?? 0.55,
      }),
      looseRect(context.nodes, {
        x1: 'x0',
        x2: 'x1',
        y1: 'y0',
        y2: 'y1',
        key: 'key',
        color: spec.color ?? 'key',
        fillOpacity: spec.fillOpacity ?? undefined,
      }),
    ],
  }
  if (spec.id !== undefined) options.id = spec.id
  if (spec.align !== undefined) options.align = spec.align
  if (spec.linkKey !== undefined) options.linkKey = spec.linkKey
  if (spec.nodeWidth !== undefined) options.nodeWidth = spec.nodeWidth
  if (spec.nodePadding !== undefined) options.nodePadding = spec.nodePadding
  if (spec.iterations !== undefined) options.iterations = spec.iterations
  if (spec.inset !== undefined) options.inset = spec.inset
  return (sankeyDiagram as (options: unknown) => ChartMark<unknown, any, any>)(options)
}

/** sunburst：返回 PolarMark，按 polar 族约定包一层 polar 容器（与 pie 同模式） */
function translateSunburst(
  spec: CxChartMarkSpec,
  datasets: CxChartDatasets | undefined,
): ChartMark<unknown, any, any> {
  const rows = resolveMarkData(spec.data, datasets)
  if (!spec.value) throw new Error('translateSunburst: sunburst 必须有 value 字段')
  const options: Record<string, unknown> = {
    ...hierarchyOptions(spec, 'nodeId'),
    value: spec.value,
  }
  if (spec.id !== undefined) options.id = spec.id
  if (spec.color !== undefined) options.color = hierarchyFieldChannel(spec.color)
  if (spec.z !== undefined) options.z = hierarchyFieldChannel(spec.z)
  if (spec.visibleDepth !== undefined) options.visibleDepth = spec.visibleDepth
  if (spec.ringPadding !== undefined) options.ringPadding = spec.ringPadding
  for (const key of [
    'stroke',
    'strokeWidth',
    'strokeOpacity',
    'fillOpacity',
    'opacity',
  ] as const) {
    if (spec[key] !== undefined) options[key] = spec[key]
  }
  const mark = (sunburst as (source: readonly unknown[], options: unknown) => unknown)(
    rows,
    options,
  )
  return translatePolar(
    {
      type: 'polar',
      marks: [],
      radiusRatio: spec.radiusRatio,
      startAngle: spec.startAngle,
      endAngle: spec.endAngle,
      inset: spec.inset,
      polarGuides: spec.polarGuides,
    },
    datasets,
    [mark],
  )
}

/** treemap：自包含 mark，直接返回 ChartMark */
function translateTreemap(
  spec: CxChartMarkSpec,
  datasets: CxChartDatasets | undefined,
): ChartMark<unknown, any, any> {
  const rows = resolveMarkData(spec.data, datasets)
  if (!spec.value) throw new Error('translateTreemap: treemap 必须有 value 字段')
  const options: Record<string, unknown> = {
    ...hierarchyOptions(spec, 'nodeId'),
    value: spec.value,
  }
  if (spec.id !== undefined) options.id = spec.id
  if (spec.color !== undefined) options.color = hierarchyFieldChannel(spec.color)
  if (spec.method !== undefined) options.method = spec.method
  if (spec.ratio !== undefined) options.ratio = spec.ratio
  if (spec.round !== undefined) options.round = spec.round
  if (spec.paddingInner !== undefined) options.paddingInner = spec.paddingInner
  if (spec.paddingOuter !== undefined) options.paddingOuter = spec.paddingOuter
  if (typeof spec.label === 'string') options.label = spec.label
  if (spec.labelPadding !== undefined) options.labelPadding = spec.labelPadding
  if (spec.labelFontSize !== undefined) options.labelFontSize = spec.labelFontSize
  if (spec.labelFontWeight !== undefined) options.labelFontWeight = spec.labelFontWeight
  if (spec.inset !== undefined) options.inset = spec.inset
  for (const key of ['fillOpacity', 'stroke', 'strokeOpacity', 'strokeWidth'] as const) {
    if (spec[key] !== undefined) options[key] = spec[key]
  }
  return (treemap as (
    source: readonly unknown[],
    options: unknown,
  ) => ChartMark<unknown, any, any>)(rows, options)
}

/** tree：treeLayout 纯布局 + 固化 link(连接线)+dot(节点) 双 mark 组合 */
function translateTree(
  spec: CxChartMarkSpec,
  datasets: CxChartDatasets | undefined,
): ChartMark<unknown, any, any>[] {
  const rows = resolveMarkData(spec.data, datasets)
  const options: Record<string, unknown> = { ...hierarchyOptions(spec, 'id') }
  if (spec.orientation !== undefined) options.orientation = spec.orientation
  if (spec.nodeSize !== undefined) options.nodeSize = spec.nodeSize
  const layout = (treeLayout as unknown as (source: readonly unknown[], options: unknown) => {
    nodes: readonly Record<string, unknown>[]
    links: readonly Record<string, unknown>[]
  })(rows, options)
  // 布局节点标识锁定 canonical id 字段（treeLayout 产物恒有 id；nodeKey 是层级源声明而非行字段）
  // 字段名 r（节点大小编码字段）同 dot 主路径契约：缺省 sqrt 缩放防恒等巨泡
  const nodeRScale = resolveRScaleOption(spec)
  return [
    looseLink(layout.links, {
      x1: 'x1',
      y1: 'y1',
      x2: 'x2',
      y2: 'y2',
      key: 'id',
      stroke: spec.stroke ?? undefined,
      strokeOpacity: spec.strokeOpacity ?? 0.55,
      strokeWidth: spec.strokeWidth ?? undefined,
    }),
    looseDot(layout.nodes, {
      x: 'x',
      y: 'y',
      key: 'id',
      r: typeof spec.r === 'string' ? hierarchyFieldChannel(spec.r) : (spec.r ?? 4.5),
      color: spec.color === undefined ? undefined : hierarchyFieldChannel(spec.color),
      strokeWidth: 1.5,
      ...(nodeRScale !== undefined ? { rScale: nodeRScale } : {}),
    }),
  ]
}

/** 缺省力集：官方示例常规四力的常量形态（函数 accessor 不可 JSON，由库缺省接管） */
const DEFAULT_FORCES: CxChartForceSpec[] = [
  { type: 'link' },
  { type: 'manyBody' },
  { type: 'center', x: 0, y: 0 },
  { type: 'collide' },
]

function translateForce(spec: CxChartForceSpec): Record<string, unknown> {
  const options: Record<string, unknown> = { type: spec.type }
  const rest = spec as unknown as Record<string, unknown>
  for (const key of ['distance', 'strength', 'x', 'y', 'radius'] as const) {
    if (rest[key] !== undefined) options[key] = rest[key]
  }
  return options
}

/** forceGraph：forceLayout 仿真 + 固化 link(连线)+dot(节点)；轴域从布局结果推导回传 */
function translateForceGraph(
  spec: CxChartMarkSpec,
  datasets: CxChartDatasets | undefined,
): { marks: ChartMark<unknown, any, any>[]; xDomain: [number, number]; yDomain: [number, number] } {
  const nodes = resolveMarkData(spec.nodes, datasets)
  const links = resolveMarkData(spec.links, datasets)
  if (!spec.nodeKey || !spec.source || !spec.target) {
    throw new Error('translateForceGraph: forceGraph 必须声明 nodeKey/source/target')
  }
  const options: Record<string, unknown> = {
    nodeKey: spec.nodeKey,
    source: spec.source,
    target: spec.target,
    forces: (spec.forces ?? DEFAULT_FORCES).map(translateForce),
  }
  if (spec.iterations !== undefined) options.iterations = spec.iterations
  if (spec.domainPadding !== undefined) options.domainPadding = spec.domainPadding
  const graph = (forceLayout as unknown as (
    nodes: readonly unknown[],
    links: readonly unknown[],
    options: unknown,
  ) => {
    nodes: readonly Record<string, unknown>[]
    links: readonly Record<string, unknown>[]
    xDomain: readonly [number, number]
    yDomain: readonly [number, number]
  })(nodes, links, options)
  const nodeRScale = resolveRScaleOption(spec)
  return {
    marks: [
      looseLink(graph.links, {
        x1: 'x1',
        y1: 'y1',
        x2: 'x2',
        y2: 'y2',
        stroke: spec.stroke ?? undefined,
        strokeOpacity: spec.strokeOpacity ?? 0.6,
        strokeWidth: spec.strokeWidth ?? undefined,
      }),
      looseDot(graph.nodes, {
        x: 'x',
        y: 'y',
        key: spec.nodeKey,
        color: spec.color ?? undefined,
        r: spec.r ?? 5,
        strokeWidth: 1.5,
        ...(nodeRScale !== undefined ? { rScale: nodeRScale } : {}),
      }),
    ],
    xDomain: [graph.xDomain[0], graph.xDomain[1]],
    yDomain: [graph.yDomain[0], graph.yDomain[1]],
  }
}

/** d3-geo 投影名称枚举 → 工厂（descriptor.type 形态：() => projection） */
const GEO_PROJECTION_FACTORIES = {
  mercator: geoMercator,
  orthographic: geoOrthographic,
  naturalEarth1: geoNaturalEarth1,
  albersUsa: geoAlbersUsa,
  equalEarth: geoEqualEarth,
  identity: geoIdentity,
} as const

/** geoShape：projection 名称枚举 → descriptor {type, fit, inset}；fit:'data' 由库拟合数据本体 */
function translateGeoShape(
  spec: CxChartMarkSpec,
  datasets: CxChartDatasets | undefined,
): ChartMark<unknown, any, any> {
  const rows = resolveMarkData(spec.data, datasets)
  const projectionName = spec.projection ?? 'mercator'
  const factory = GEO_PROJECTION_FACTORIES[projectionName]
  if (!factory) {
    throw new Error(`translateGeoShape: 未知投影 "${String(projectionName)}"`)
  }
  const options: Record<string, unknown> = {
    projection: {
      type: factory,
      fit: spec.fit ?? 'data',
      ...(spec.inset !== undefined ? { inset: spec.inset } : {}),
    },
  }
  if (spec.id !== undefined) options.id = spec.id
  if (spec.key !== undefined) options.key = spec.key
  if (spec.color !== undefined) options.color = spec.color
  if (spec.r !== undefined) options.r = spec.r
  // 点符号 geoShape（bubble map）的 r 字段名 channel 同 dot 契约：缺省注入 sqrt 缩放
  const rScale = resolveRScaleOption(spec)
  if (rScale !== undefined) options.rScale = rScale
  for (const key of [
    'fill',
    'fillOpacity',
    'stroke',
    'strokeOpacity',
    'strokeWidth',
    'strokeDasharray',
    'opacity',
  ] as const) {
    if (spec[key] !== undefined) options[key] = spec[key]
  }
  return (geoShape as (
    source: readonly unknown[],
    options: unknown,
  ) => ChartMark<unknown, any, any>)(rows, options)
}

/**
 * facet：chart 回调固化为递归子 spec 翻译——translateChild 由 definition.ts 注入
 * （子 spec 翻译与顶层同路径，仅数据集换为 facet 分组行；规避 composite ↔ definition 循环 import）。
 * label 语义：true 显示分组 key 标签（库的函数形态不可 JSON，布尔即可覆盖声明式场景）。
 */
function translateFacet(
  spec: CxChartMarkSpec,
  datasets: CxChartDatasets | undefined,
  translateChild: (spec: CxChartSpec, rows: readonly unknown[]) => unknown,
): ChartMark<unknown, any, any> {
  const rows = resolveMarkData(spec.data, datasets)
  if (!spec.by) throw new Error('translateFacet: facet 必须声明 by 分组字段')
  if (!spec.chart) throw new Error('translateFacet: facet 必须声明 chart 子 spec 模板')
  const childTemplate = spec.chart
  const options: Record<string, unknown> = {
    by: spec.by,
    chart: (facetRows: readonly unknown[]) => translateChild(childTemplate, facetRows),
  }
  if (spec.id !== undefined) options.id = spec.id
  if (spec.columns !== undefined) options.columns = spec.columns
  if (spec.minWidth !== undefined) options.minWidth = spec.minWidth
  if (spec.gap !== undefined) options.gap = spec.gap
  if (typeof spec.label === 'boolean') options.label = spec.label
  if (spec.axes !== undefined) options.axes = spec.axes
  return (facet as (source: readonly unknown[], options: unknown) => ChartMark<unknown, any, any>)(
    rows,
    options,
  )
}

/** 复合 type 守卫（definition 组装层据此分流；sunburst 虽属 polar 族约定，分发仍走此处） */
export const COMPOSITE_TYPES: ReadonlySet<string> = new Set([
  'sankey',
  'sunburst',
  'treemap',
  'tree',
  'forceGraph',
  'geoShape',
  'facet',
])

/**
 * 复合 mark 分发。tree/forceGraph 展开为多 mark；forceGraph 额外回传轴域推导结果。
 * translateChild 仅 facet 需要。
 */
export function translateCompositeMark(
  spec: CxChartMarkSpec,
  datasets: CxChartDatasets | undefined,
  translateChild: (spec: CxChartSpec, rows: readonly unknown[]) => unknown,
): {
  marks: ChartMark<unknown, any, any>[]
  xDomain?: [number, number]
  yDomain?: [number, number]
} {
  switch (spec.type) {
    case 'sankey':
      return { marks: [translateSankey(spec, datasets)] }
    case 'sunburst':
      return { marks: [translateSunburst(spec, datasets)] }
    case 'treemap':
      return { marks: [translateTreemap(spec, datasets)] }
    case 'tree':
      return { marks: translateTree(spec, datasets) }
    case 'forceGraph':
      return translateForceGraph(spec, datasets)
    case 'geoShape':
      return { marks: [translateGeoShape(spec, datasets)] }
    case 'facet':
      return { marks: [translateFacet(spec, datasets, translateChild)] }
    default:
      throw new Error(`translateCompositeMark: 未知复合 mark type "${String(spec.type)}"`)
  }
}
