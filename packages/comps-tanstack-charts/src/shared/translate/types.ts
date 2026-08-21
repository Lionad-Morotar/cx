import type { ChartTheme } from '@tanstack/charts'

/**
 * 声明式 JSON 类型：物料 data 的投影形态。
 *
 * Why 存在：defineChart 的 definition 含三类不可 JSON 化值——scale（函数工厂/实例）、
 * curve（ChartCurve 函数对）、回调（format/accessor/tooltip content）。cx 物料 data 必须
 * 纯 JSON，本模块把声明式描述（kind 枚举、curve 枚举、字段名 channel、标量子集）约束为
 * 可 JSON 化形态，由翻译层编译为运行时实例。channel 仅支持字段名字符串：低代码与
 * LLM 生成场景不要求 accessor 函数（accessor 逻辑经数据预置烘焙降级）。
 */

export type CxChartCurveName =
  | 'linear'
  | 'linearClosed'
  | 'monotoneX'
  | 'step'
  | 'stepAfter'
  | 'stepBefore'
  | 'basis'
  | 'natural'
  | 'catmullRom'

/**
 * scale 声明式枚举。时间系（utc/time）domain 用 ISO 8601 字符串表达
 * （Date 实例 JSON 不可表达，翻译层负责 new Date 转换）。
 */
export type CxChartScaleSpec =
  | { kind: 'linear'; domain?: [number, number] }
  | { kind: 'utc' | 'time'; domain?: [string, string] }
  | { kind: 'log' | 'sqrt' | 'symlog'; domain?: [number, number] }
  | { kind: 'pow'; exponent?: number; domain?: [number, number] }
  | { kind: 'point'; domain?: string[]; padding?: number }
  | { kind: 'band'; domain?: string[]; padding?: number }
  | { kind: 'ordinal'; domain?: string[] }

export interface CxChartAxisSpec {
  scale?: CxChartScaleSpec
  nice?: boolean | number
  reverse?: boolean
  grid?: boolean
  /**
   * 半径像素 range 的比例对（相对 polar 最终半径，0–1），仅 polar 容器的
   * radiusAxis 消费；物化为官方 PolarLength 回调数组（resize 时随最终半径重解析）。
   * 用途：rose/径向条等需要「语义零映射到内径偏移」而非物理圆心的场景。
   */
  range?: [number, number]
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

/**
 * mark layout 声明式（stack/group/dodge 挂 mark.layout 字段；
 * group 的 scale 函数形态不可 JSON，仅暴露 padding）。
 */
export type CxChartLayoutSpec =
  | {
      kind: 'stack'
      order?: 'input' | 'ascending' | 'descending' | 'inside-out' | string[]
      offset?: 'diverging' | 'normalize' | 'center' | 'wiggle'
      reverse?: boolean
      anchor?: { series: string; fraction?: number }
    }
  | { kind: 'group'; padding?: number }
  | { kind: 'dodgeX'; anchor?: 'left' | 'middle' | 'right'; padding?: number }
  | { kind: 'dodgeY'; anchor?: 'bottom' | 'middle' | 'top'; padding?: number }

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
  | 'link'
  | 'arrow'
  | 'vector'
  | 'hexagon'
  | 'frame'
  | 'boxY'
  | 'boxX'
  | 'violinY'
  | 'violinX'
  | 'ridgelineY'
  | 'ridgelineX'
  | 'waffleY'
  | 'waffleX'
  | 'differenceY'
  | 'differenceX'
  | 'linearRegressionY'
  | 'linearRegressionX'
  // spatial 系（mark.ts 经 @tanstack/charts/spatial/* 子路径直译）
  | 'voronoi'
  | 'hexbin'
  | 'contour'
  | 'delaunayLink'
  | 'density'
  // 以下由 polar.ts / composite.ts 分支处理（非 MARK_FACTORIES 直译）
  | 'polar'
  | 'pie'
  | 'radialArc'
  | 'radialBarRadius'
  | 'radialBarAngle'
  | 'radialLine'
  | 'radialArea'
  | 'radialDot'
  | 'radialText'
  | 'radialRule'
  | 'sankey'
  | 'sunburst'
  | 'treemap'
  | 'tree'
  | 'forceGraph'
  | 'geoShape'
  | 'facet'

/**
 * 单 mark 声明式。平铺契约（LLM 友好）：专有标量字段全部可选、按名透传，
 * 不适用的字段被对应工厂忽略；channel 只接受字段名字符串（弹性 channel
 * angle/radius/width/height/length/rotate/r 另接受数值常量；x1/y1 仅在
 * rect 基线场景接受数值常量——对应官方直方图零基线写法 y1:()=>0）。
 */
export interface CxChartMarkSpec {
  type: CxChartMarkType
  /**
   * 行数组（内嵌，常量数组亦可）或命名数据集字符串引用。
   * 字符串引用由 translateChartSpec 的 datasets 表解析——GenUI 契约是数据顶层化
   * （data.rows 与 definition 平级），marks 内以 "rows" 引用；未命中一律回退空数组
   * （流式中间态与笔误运行时不可区分，渲染层容错优先，笔误显式化归生成期校验门）。
   */
  data?: readonly unknown[] | string
  id?: string
  /**
   * 装饰层开关：true 时经库 decorative() 包装——保留比例尺与绘制几何、剥离交互
   * 所有权（tooltip 命中/焦点/条件高亮均跳过该 mark）。典型：辅助折线/参考线/标注
   * 不抢数据点的 tooltip 命中。库层约束是带 focus/states 行为的 mark 不可包装
   * （initialize 抛 TypeError），本 grammar 不暴露条件态声明，故恒安全。
   */
  decorative?: boolean
  // --- 字段名 channel ---
  // x1/y1 另接受数值常量（运行时白名单仅放行 rect 基线场景，对应官方 y1:()=>0
  // 零基线写法；其余 mark 传常量仍在运行时抛错，类型放宽是 JSON spec 无类型门的如实表达）
  x?: string
  y?: string
  x1?: string | number
  y1?: string | number
  x2?: string
  y2?: string
  z?: string
  color?: string
  key?: string
  text?: string
  // --- 弹性 channel（字段名或数值常量） ---
  r?: string | number
  /**
   * 半径缩放声明式（仅 r 为字段名时消费；数值常量 r 是显式像素意图，不缩放）。
   * 库缺省 rScale 为恒等映射（原始值直接当像素半径），翻译层对字段名 r 缺省注入
   * sqrt 面积映射（半径∝√值 ⇒ 面积∝值，气泡图感知编码约定），本字段覆盖其
   * range 像素上下界；kind 不收（sqrt 是气泡半径的正确默认，线性半径会平方夸大差异）。
   */
  rScale?: { range?: [number, number] }
  angle?: string | number
  radius?: string | number
  width?: string | number
  height?: string | number
  length?: string | number
  rotate?: string | number
  // --- 通用样式 ---
  stroke?: string
  strokeWidth?: number
  strokeOpacity?: number
  strokeDasharray?: string
  fill?: string
  fillOpacity?: number
  fontSize?: number
  fontWeight?: number
  dx?: number
  dy?: number
  points?: boolean
  opacity?: number
  curve?: CxChartCurveName
  layout?: CxChartLayoutSpec
  // --- mark 专有标量（按名透传，不适用者被工厂忽略） ---
  span?: number
  overlap?: number
  unit?: number
  round?: boolean
  gap?: number
  columns?: number
  headLength?: number
  headAngle?: number
  lineCap?: 'butt' | 'round' | 'square'
  anchor?: 'start' | 'middle' | 'end'
  ci?: number
  samples?: number
  positiveFill?: string
  negativeFill?: string
  positiveFillOpacity?: number
  negativeFillOpacity?: number
  comparisonStroke?: string
  cornerRadius?: number
  padAngle?: number
  radiusOffset?: number
  /** radial 系径向起止（radialRule 引导线/指针、radialBarRadius/radialArea 内径端）：字段名或数值常量 */
  radius1?: string | number
  radius2?: string | number
  /** radialBarAngle 弧段角度起止（显式堆叠弧段）：字段名或数值常量 */
  angle1?: string | number
  angle2?: string | number
  baseline?: 'auto' | 'middle' | 'hanging'
  inset?: number
  // --- spatial mark 专有（hexbin/contour；voronoi/delaunayLink 复用通用 channel） ---
  /** hexbin 相邻 bin 中心水平像素距 */
  binWidth?: number
  /** hexbin 聚合输出（reduce 枚举同 transforms） */
  outputs?: CxChartTransformOutputs
  /** contour 等值线层数或精确层级（标量网格字段复用通用 value channel）；density 同字段表达密度层级 */
  thresholds?: number | number[]
  /** contour 线性插值平滑（缺省 true） */
  smooth?: boolean
  /** density 高斯核带宽（CSS 像素，库缺省 20） */
  bandwidth?: number
  /** density 密度网格单元尺寸（CSS 像素，库缺省 4） */
  cellSize?: number
  // --- polar 容器与命名复合（polar.ts / composite.ts 消费） ---
  marks?: CxChartMarkSpec[]
  radiusRatio?: number
  startAngle?: number
  endAngle?: number
  angleAxis?: CxChartAxisSpec
  radiusAxis?: CxChartAxisSpec
  polarGuides?: CxChartPolarGuideSpec[]
  innerRadiusRatio?: number
  outerRadiusRatio?: number
  // --- 层级数据源（sunburst/treemap/tree）：path 模式或 nodeId+parentId 平铺模式 ---
  value?: string
  path?: string
  delimiter?: string
  nodeId?: string
  parentId?: string
  nodes?: string
  links?: string
  nodeKey?: string
  source?: string
  target?: string
  /** sankey 稳定连线标识字段 */
  linkKey?: string
  /** forceGraph 仿真参数与力集（缺省固化常规四力：link/manyBody/center/collide） */
  domainPadding?: number
  forces?: CxChartForceSpec[]
  align?: 'left' | 'right' | 'center' | 'justify'
  nodeWidth?: number
  nodePadding?: number
  iterations?: number
  method?: 'squarify' | 'binary' | 'dice' | 'slice' | 'slice-dice'
  ratio?: number
  paddingInner?: number
  paddingOuter?: number
  /** treemap 叶子标签字段名（string）；facet 分组标签开关（boolean）——按 mark type 分别消费 */
  label?: string | boolean
  labelPadding?: number
  labelFontSize?: number
  labelFontWeight?: number
  orientation?: 'left' | 'right' | 'top' | 'bottom'
  nodeSize?: [number, number]
  /* facet 子模板内可用 {$by:{组名:投影名}} 按组分化(投影画廊场景);
     实例化在 translateFacet 递归前完成,translateGeoShape 拿到的恒为枚举字符串 */
  projection?:
    | 'mercator'
    | 'orthographic'
    | 'naturalEarth1'
    | 'albersUsa'
    | 'equalEarth'
    | 'equirectangular'
    | 'identity'
    | { $by: Record<string, 'mercator' | 'orthographic' | 'naturalEarth1' | 'albersUsa' | 'equalEarth' | 'equirectangular' | 'identity'> }
  /* 'data' 拟合本层数据;'sphere' 拟合全球面;{data} 引用另一命名数据集——
     多层 geoShape(底图+叠加层)共享同一 fit 目标时投影才对齐 */
  fit?: 'data' | 'sphere' | { data: string }
  by?: string
  axes?: 'outer' | 'cell'
  minWidth?: number
  chart?: CxChartSpec
  visibleDepth?: number
  ringPadding?: number
}

/** polar guides（radialGrid/angleGrid）声明式 */
export interface CxChartPolarGuideSpec {
  kind: 'radialGrid' | 'angleGrid'
  values?: (number | string)[]
  ticks?: number
  shape?: 'circle' | 'polygon'
  labels?: boolean
  labelAngle?: number
  labelOffset?: number
  /* PolarGuideStyle 字面量子集(label*Option 的函数形态不可 JSON,仅收字面量) */
  id?: string
  className?: string
  labelClassName?: string
  stroke?: string
  strokeOpacity?: number
  strokeWidth?: number
  strokeDasharray?: string
  fill?: string
  fillOpacity?: number
  labelFill?: string
  labelFontSize?: number
  labelAnchor?: 'start' | 'middle' | 'end'
  labelBaseline?: 'auto' | 'middle' | 'hanging'
  labelDx?: number
  labelDy?: number
  labelRotate?: number
}

/**
 * forceGraph 力集声明式：库 ForceDescriptor 的 JSON 子集。
 * 数值参数接受字段名字符串（库 ForceNumericValue 支持 TransformValue）；
 * custom 工厂形态不可 JSON，不收录。
 */
export type CxChartForceSpec =
  | { type: 'link'; distance?: number | string; strength?: number | string }
  | { type: 'manyBody'; strength?: number | string }
  | { type: 'center'; x?: number; y?: number }
  | { type: 'collide'; radius?: number | string; strength?: number }
  | { type: 'x'; x?: number | string; strength?: number | string }
  | { type: 'y'; y?: number | string; strength?: number | string }

/**
 * reduce 枚举（outputs 归约器）：字符串枚举全可 JSON；
 * quantile 带参数用对象形态 { quantile: 0.25 }。
 */
export type CxChartReduce =
  | 'count'
  | 'sum'
  | 'mean'
  | 'min'
  | 'max'
  | 'median'
  | 'first'
  | 'last'
  | 'variance'
  | 'deviation'
  | 'delta'
  | 'ratio'
  | { quantile: number }

export interface CxChartTransformOutputs {
  [name: string]: { value?: string; reduce: CxChartReduce }
}

/**
 * 数据预处理管道：spec 顶层 transforms 数组，按序执行，
 * 每步产物以 name 注册进数据集表（marks/transforms 后续步骤可字符串引用）。
 * data 缺省引用 'rows'。binTime 系不收录（interval 对象 JSON 不可表达——时间分箱由
 * 数据预置聚合降级）。
 */
export type CxChartTransformSpec =
  | {
      name: string
      kind: 'groupBy'
      data?: string
      by: string | Record<string, string>
      outputs: CxChartTransformOutputs
    }
  | {
      name: string
      kind: 'binX' | 'binY'
      data?: string
      value: string
      by?: string | Record<string, string>
      thresholds?: number | number[]
      domain?: [number, number]
      outputs?: CxChartTransformOutputs
    }
  | {
      name: string
      kind: 'binXY'
      data?: string
      x: string
      y: string
      by?: string | Record<string, string>
      xThresholds?: number | number[]
      yThresholds?: number | number[]
      xDomain?: [number, number]
      yDomain?: [number, number]
      outputs?: CxChartTransformOutputs
    }
  | {
      name: string
      kind: 'rollingWindow'
      data?: string
      size: number
      by?: string | Record<string, string>
      anchor?: 'start' | 'middle' | 'end'
      partial?: boolean
      outputs: CxChartTransformOutputs
      orderBy?: string
      order?: 'ascending' | 'descending'
    }
  | {
      name: string
      kind: 'normalize'
      data?: string
      value: string
      by?: string | Record<string, string>
      as?: string
      basis?: 'sum' | 'max' | 'extent' | 'first' | 'last'
    }
  | {
      name: string
      kind: 'cumulative'
      data?: string
      by?: string | Record<string, string>
      outputs: CxChartTransformOutputs
      orderBy?: string
      order?: 'ascending' | 'descending'
    }
  | {
      name: string
      kind: 'fold'
      data?: string
      fields: string[]
      as?: { key: string; value: string }
    }
  | {
      name: string
      kind: 'rank'
      data?: string
      value: string
      by?: string | Record<string, string>
      order?: 'ascending' | 'descending'
      ties?: 'competition' | 'dense' | 'ordinal'
      as?: string
    }
  | {
      name: string
      kind: 'select'
      data?: string
      by?: string | Record<string, string>
      value?: string
      select: 'first' | 'last' | 'min' | 'max'
    }
  | {
      name: string
      kind: 'stackRowsY' | 'stackRowsX'
      data?: string
      x: string
      y: string
      z?: string
      order?: 'input' | 'ascending' | 'descending' | 'inside-out' | string[]
      offset?: 'diverging' | 'normalize' | 'center' | 'wiggle'
      reverse?: boolean
      anchor?: { series: string; fraction?: number }
    }
  | {
      name: string
      kind: 'waterfall'
      data?: string
      value: string
      by?: string | Record<string, string>
      total?: boolean
      orderBy?: string
      order?: 'ascending' | 'descending'
    }
  | {
      name: string
      kind: 'mosaicY' | 'mosaicX'
      data?: string
      x: string
      y: string
      value: string
      xOrder?: (string | number)[]
      yOrder?: (string | number)[]
    }
  | {
      name: string
      kind: 'linearRegressionRowsY' | 'linearRegressionRowsX'
      data?: string
      x: string
      y: string
      z?: string
      ci?: number
      samples?: number
    }
  | { name: string; kind: 'boxRows'; data?: string; category: string; value: string }
  | {
      name: string
      kind: 'pie'
      data?: string
      value: string
      /** CX 统一 padAngle 命名（transform 侧字段为 gapAngle，翻译层映射） */
      padAngle?: number
      startAngle?: number
      endAngle?: number
    }

/** 命名数据集表：物料 data 顶层除 definition 外的数组字段全量分馏（rows 恒为主数据集，其余按语义自由命名：geo 的 sphere/land、分层图 innerRows/outerRows 等） */
export type CxChartDatasets = Record<string, readonly unknown[] | undefined>

/** viewGrid 网格轨道：size 固定像素 / grow 按比例分配剩余空间（min/max 钳制） */
export type CxChartViewTrack = { id: string; size: number } | { id: string; grow: number; min?: number; max?: number }

/** viewGrid 轴链接目标：share 共享 scale（domain/序/方向/bandwidth 须一致，不一致显式失败）；align 仅对齐 plot 端点、domain 各自独立 */
export interface CxChartViewLink {
  x?: string
  y?: string
}

export interface CxChartViewItem {
  id: string
  /** 轨道引用：row/column 分别指向 views.rows/views.columns 的轨道 id */
  row: string
  column: string
  share?: CxChartViewLink
  align?: CxChartViewLink
  /**
   * 子视图 spec（marks/x/y/color/margin/guides/transforms 等归属子图）；
   * host 权属字段（tooltip/pointer/keyboard/focus/focusRing）归外层组合定义，
   * 子视图声明即拒绝（官方 assertChildDefinition 契约）；不支持嵌套 views。
   */
  chart: CxChartSpec
}

/** viewGrid 多视图组合（非重叠网格；叠层/内嵌等组合形态官方 composeViews 支持、契约暂不暴露） */
export interface CxChartViewGridSpec {
  rows: CxChartViewTrack[]
  columns: CxChartViewTrack[]
  gap?: number
  rowGap?: number
  columnGap?: number
  items: CxChartViewItem[]
}

export interface CxChartSpec {
  /** viewGrid 顶层省略（views 与 marks 互斥）；其余场景必填 */
  marks?: CxChartMarkSpec[]
  /** 多视图组合：存在时 marks 须为空，各子视图在网格单元内独立成图、共享外层 host */
  views?: CxChartViewGridSpec
  x?: CxChartAxisSpec | null
  y?: CxChartAxisSpec | null
  theme?: Partial<ChartTheme>
  margin?: number | { top?: number; right?: number; bottom?: number; left?: number }
  guides?: boolean
  clip?: boolean
  /** 数据预处理管道（顶层声明，marks 之前执行；产物注册进 datasets 表） */
  transforms?: CxChartTransformSpec[]
  /** color scale 声明式（domain/range 直可 JSON；legend 为图例声明） */
  color?: {
    domain?: (string | number)[]
    range?: string[]
    legend?:
      | true
      | {
          kind?: 'color' | 'gradient'
          label?: string
          placement?: 'top' | 'bottom'
          itemWidth?: number
          steps?: number
          width?: number
        }
  }
  tooltip?:
    | boolean
    | {
        placement?:
          | 'auto'
          | 'top'
          | 'top-right'
          | 'right'
          | 'bottom-right'
          | 'bottom'
          | 'bottom-left'
          | 'left'
          | 'top-left'
          | (
              | 'top'
              | 'top-right'
              | 'right'
              | 'bottom-right'
              | 'bottom'
              | 'bottom-left'
              | 'left'
              | 'top-left'
            )[]
        offset?: number
        sticky?: boolean
        visibility?: 'focus' | 'pinned'
        anchor?:
          | 'point'
          | 'pointer'
          | 'group-center'
          | {
              x?: 'point' | 'pointer' | 'value' | 'group-center' | 'plot-left' | 'plot-center' | 'plot-right'
              y?: 'point' | 'pointer' | 'value' | 'group-center' | 'plot-top' | 'plot-center' | 'plot-bottom'
            }
        sort?: 'visual' | 'color-domain' | 'focus'
        /** 追加到 tooltip 根元素的自定义类名(`ts-chart-tooltip <className>`),
         *  供物料/宿主用 CSS 分化指示器等外壳样式 */
        className?: string
        items?: (
          | 'x'
          | 'y'
          | 'group'
          | { channel: 'x' | 'y' | 'group'; label?: string }
          | { field: string; label?: string }
        )[]
      }
  pointer?: boolean
  keyboard?: boolean
  focusRing?: boolean
  focus?: 'nearest' | 'nearest-x' | 'nearest-y' | 'group-x' | 'group-y'
  /**
   * 动效声明（可 JSON 化子集）。声明即走 motion 挂载分支：库 vue adapter 未暴露
   * motion renderer 注入，cx 组件层自组装 renderer adapter。transition/delay 翻译为
   * 库 definition.motion 的 chart 级默认时序；initial/resize 为 renderer 级选项。
   * mark 级 per-datum motion 回调不可 JSON 化，不收。
   */
  motion?: {
    transition?:
      | {
          type: 'tween'
          duration?: number
          easing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out'
        }
      | {
          type: 'spring'
          stiffness?: number
          damping?: number
          mass?: number
          restSpeed?: number
          restDelta?: number
        }
    delay?: number
    initial?: boolean | 'always'
    resize?: boolean
  }
}
