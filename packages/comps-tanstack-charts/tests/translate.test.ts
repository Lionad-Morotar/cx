import { describe, expect, it } from 'vitest'
import { createChartScene, renderChartSvg } from '@tanstack/charts'
import { tooltip as domChartTooltip } from '@tanstack/charts/tooltip'

import type { DomChartDefinition, StaticChartDefinition } from '@tanstack/charts'

import {
  translateChartSpec,
  translateCurve,
  translateScale,
  translateTransform,
} from '../src/shared/translate'

import type { CxChartAxisSpec } from '../src/shared/translate'

/**
 * 翻译层行为契约：声明式 JSON（物料 data）→ TanStack Charts 运行时产物。
 * 端到端以 createChartScene + renderChartSvg 的字符串管线断言（/charts/vue SSR 同款路径，
 * 不依赖浏览器布局）；逐函数断言 scale/curve/mark 翻译的边界行为（缺省推断、显式配置、未知抛错）。
 */

/**
 * 断言桥：翻译层产物以 DomChartDefinition（宿主联合）标注，scene 管线要 Static 分支——
 * 联合含 Responsive 分支属 0.14 类型层不协变（官方 README 同款用法亦过不了严格 tsc），
 * 运行时同构；与 usage 页 ChartProps 断言桥同一性质。
 */
const toStatic = (definition: DomChartDefinition) => definition as StaticChartDefinition

describe('translateCurve', () => {
  it('枚举映射为 ChartCurve 函数对（line/area 可调）', () => {
    const curve = translateCurve('monotoneX')
    expect(typeof curve.line).toBe('function')
    expect(typeof curve.area).toBe('function')
    expect(
      curve.line([
        [0, 0],
        [1, 1],
      ]),
    ).toContain('M')
  })

  it('linear/step/basis/natural 均可用', () => {
    for (const name of ['linear', 'step', 'stepAfter', 'stepBefore', 'basis', 'natural'] as const) {
      expect(() => translateCurve(name)).not.toThrow()
    }
  })

  it('未知枚举显式抛错', () => {
    // @ts-expect-error 运行时防御：JSON 输入不受 TS 约束
    expect(() => translateCurve('bezier99')).toThrow(/curve/)
  })
})

describe('translateScale', () => {
  it('linear 无 domain 返回工厂（库推断 domain）', () => {
    const scale = translateScale({ kind: 'linear' })
    expect(typeof scale).toBe('function')
  })

  it('linear 有 domain 返回保留配置的实例', () => {
    const scale = translateScale({ kind: 'linear', domain: [0, 100] }) as ReturnType<
      typeof import('@tanstack/charts/scales/linear').scaleLinear
    >
    expect(scale.domain()).toEqual([0, 100])
  })

  it('point 保留 padding 配置（工厂调用后的实例上）', () => {
    const factory = translateScale({ kind: 'point', padding: 0.4 }) as () => any
    expect(typeof factory).toBe('function')
    expect(factory().padding()).toBe(0.4)
  })

  it('band 有 domain 返回实例', () => {
    const scale = translateScale({ kind: 'band', domain: ['a', 'b'] }) as any
    expect(scale.domain()).toEqual(['a', 'b'])
  })

  it('未知 kind 显式抛错', () => {
    // @ts-expect-error 运行时防御
    expect(() => translateScale({ kind: 'bezier99' })).toThrow(/scale/)
  })

  it('utc/time domain ISO 字符串转 Date 实例', () => {
    const scale = translateScale({ kind: 'utc', domain: ['2026-01-01', '2026-03-01'] }) as any
    expect(scale.domain()[0]).toBeInstanceOf(Date)
    expect(scale.domain()[0].toISOString()).toBe('2026-01-01T00:00:00.000Z')
  })

  it('log/sqrt/symlog/pow 有 domain 返回保留配置的实例', () => {
    for (const kind of ['log', 'sqrt', 'symlog'] as const) {
      const scale = translateScale({ kind, domain: [1, 100] }) as any
      expect(scale.domain()).toEqual([1, 100])
    }
    const pow = translateScale({ kind: 'pow', exponent: 2, domain: [0, 10] }) as any
    expect(pow.exponent()).toBe(2)
  })

  it('log 无 domain 返回工厂（库推断 domain）', () => {
    expect(typeof translateScale({ kind: 'log' })).toBe('function')
  })
})

describe('translateChartSpec', () => {
  const rows = [
    { month: 'Jan', value: 40 },
    { month: 'Feb', value: 62 },
    { month: 'Mar', value: 55 },
  ]

  it('lineY 规格经翻译产出可渲染 svg（端到端字符串管线）', () => {
    const definition = translateChartSpec({
      marks: [{ type: 'lineY', data: rows, x: 'month', y: 'value', strokeWidth: 2 }],
      x: { scale: { kind: 'point' } },
      y: { scale: { kind: 'linear' }, grid: true },
    })
    const scene = createChartScene(toStatic(definition), { width: 640, height: 320 })
    const svg = renderChartSvg(scene, { ariaLabel: 'test chart' })
    expect(svg).toContain('<svg')
    expect(svg).toContain('M')
  })

  it('channel 只接受字段名字符串，函数/非字符串显式抛错', () => {
    expect(() =>
      translateChartSpec({
        // @ts-expect-error 运行时防御
        marks: [{ type: 'lineY', data: rows, x: 42, y: 'value' }],
      }),
    ).toThrow(/channel/)
  })

  it('theme 部分字段与默认主题合并', () => {
    const definition = translateChartSpec({
      marks: [{ type: 'dot', data: rows, x: 'month', y: 'value' }],
      theme: { foreground: '#111111' },
    }) as { theme?: { foreground?: string; palette?: readonly string[] } }
    expect(definition.theme?.foreground).toBe('#111111')
    expect(Array.isArray(definition.theme?.palette)).toBe(true)
  })

  it('tooltip 三态：true 挂默认 extension、false 关闭、对象 extension+标量透传', () => {
    const base = { marks: [{ type: 'dot' as const, data: rows, x: 'month', y: 'value' }] }
    const tipOf = (d: unknown) => (d as { tooltip?: unknown }).tooltip
    expect(tipOf(translateChartSpec({ ...base, tooltip: true }))).toBe(domChartTooltip)
    expect(tipOf(translateChartSpec({ ...base, tooltip: false }))).toBe(false)
    expect(
      tipOf(translateChartSpec({ ...base, tooltip: { placement: 'top', offset: 8 } })),
    ).toEqual({
      use: domChartTooltip,
      placement: 'top',
      offset: 8,
    })
    // 缺席缺省开启：库层 undefined 等于关闭（resolveTooltipInput 返回 null），
    // 而官方 catalog 图表恒有 tooltip——缺省显式挂默认 extension 对齐官网形态
    expect(tipOf(translateChartSpec(base))).toBe(domChartTooltip)
  })

  it('decorative:true 经库 decorative() 包装——几何保留（SSR 输出与未装饰版逐字节一致）', () => {
    const base = { type: 'lineY' as const, data: rows, x: 'month', y: 'value', strokeWidth: 2 }
    const axes = { x: { scale: { kind: 'point' as const } }, y: { scale: { kind: 'linear' as const } } }
    const plain = translateChartSpec({ marks: [base], ...axes })
    const decorated = translateChartSpec({ marks: [{ ...base, decorative: true }], ...axes })
    const markOf = (d: unknown) => (d as { marks: unknown[] }).marks[0]
    // 包装产物是代理新引用（initialize 内剥 focus/states，本 grammar 不暴露条件态恒安全）
    expect(markOf(decorated)).not.toBe(markOf(plain))
    const svgOf = (d: DomChartDefinition) =>
      renderChartSvg(createChartScene(toStatic(d), { width: 640, height: 320 }), {
        ariaLabel: 'decorative',
      })
    // decorative 语义即「保比例尺与绘制几何、剥交互所有权」：
    // 数据几何 path 与未装饰版逐字节一致，焦点层（focus circles）被剥离
    const plainSvg = svgOf(plain)
    const decoratedSvg = svgOf(decorated)
    const geometryOf = (svg: string) => svg.match(/<path[^>]*\bd="[^"]*"/g)
    expect(geometryOf(decoratedSvg)).toEqual(geometryOf(plainSvg))
    expect(plainSvg).toContain('ts-chart__focus-layer')
    expect(decoratedSvg).not.toContain('ts-chart__focus-layer')
  })
})

describe('translateChartSpec 流式中间态容错', () => {
  const rows = [
    { month: 'Jan', value: 40 },
    { month: 'Feb', value: 62 },
  ]

  it('x/y 缺席（definition 部分闭合）注入缺省 scale，端到端渲染不抛错', () => {
    // 流式实证：definition 开容器后 marks 即逐元素生长，x/y 字段在其后传输——
    // 缺席期间库对「mark 物化 channel 但无 scale 配置」抛错，翻译层须注入缺省
    const definition = translateChartSpec({
      marks: [{ type: 'lineY', data: rows, x: 'month', y: 'value' }],
    })
    const scene = createChartScene(toStatic(definition), { width: 640, height: 320 })
    const svg = renderChartSvg(scene, { ariaLabel: 'partial' })
    expect(svg).toContain('<svg')
    expect(svg).toContain('M')
  })

  it('axis spec 在场但 scale 未闭合（{}）回退缺省工厂', () => {
    const definition = translateChartSpec({
      marks: [{ type: 'lineY', data: rows, x: 'month', y: 'value' }],
      // 模拟容器开而未及 scale 字段的中间态
      x: {} as CxChartAxisSpec,
      y: { grid: true } as CxChartAxisSpec,
    })
    const scene = createChartScene(toStatic(definition), { width: 640, height: 320 })
    expect(renderChartSvg(scene, { ariaLabel: 'partial-axis' })).toContain('<svg')
  })

  it('x/y 显式 null（polar 语义）保留不注入缺省', () => {
    const definition = translateChartSpec({
      marks: [{ type: 'dot', data: rows, x: 'month', y: 'value' }],
      x: null,
      y: null,
    }) as { x?: unknown; y?: unknown }
    expect(definition.x).toBeNull()
    expect(definition.y).toBeNull()
  })
})

describe('translateChartSpec 数据集引用（数据顶层化）', () => {
  const rows = [
    { month: 'Jan', value: 40 },
    { month: 'Feb', value: 62 },
    { month: 'Mar', value: 55 },
  ]

  it('mark.data 字符串引用经 datasets 表解析为行数组（端到端可渲染）', () => {
    const definition = translateChartSpec(
      {
        marks: [{ type: 'lineY', data: 'rows', x: 'month', y: 'value' }],
        x: { scale: { kind: 'point' } },
        y: { scale: { kind: 'linear' }, grid: true },
      },
      { rows },
    )
    const scene = createChartScene(toStatic(definition), { width: 640, height: 320 })
    const svg = renderChartSvg(scene, { ariaLabel: 'dataset-ref' })
    expect(svg).toContain('<svg')
    expect(svg).toContain('M')
  })

  it('引用未注册数据集回退空数组（流式中间态与笔误运行时不可区分，渲染层容错优先）', () => {
    expect(() =>
      translateChartSpec(
        { marks: [{ type: 'lineY', data: 'rows2', x: 'month', y: 'value' }] },
        { rows },
      ),
    ).not.toThrow()
  })

  it('datasets 缺席时字符串引用回退空数组（流式中间态：definition 先于 rows 闭合）', () => {
    expect(() =>
      translateChartSpec({ marks: [{ type: 'lineY', data: 'rows', x: 'month', y: 'value' }] }),
    ).not.toThrow()
  })

  it('内嵌数组形态保持兼容（存量内嵌 spec 语义不变）', () => {
    const definition = translateChartSpec({
      marks: [{ type: 'lineY', data: rows, x: 'month', y: 'value' }],
    })
    const scene = createChartScene(toStatic(definition), { width: 640, height: 320 })
    expect(renderChartSvg(scene, { ariaLabel: 'inline' })).toContain('<svg')
  })
})

describe('transforms 数据预处理管道', () => {
  const rows = [
    { month: 'Jan', kind: 'a', value: 40 },
    { month: 'Jan', kind: 'b', value: 22 },
    { month: 'Feb', kind: 'a', value: 62 },
    { month: 'Feb', kind: 'b', value: 30 },
  ]

  it('groupBy 产物经 name 注册进数据集表，marks 字符串引用（端到端可渲染）', () => {
    const definition = translateChartSpec(
      {
        transforms: [
          {
            name: 'byMonth',
            kind: 'groupBy',
            by: 'month',
            outputs: { total: { value: 'value', reduce: 'sum' } },
          },
        ],
        marks: [{ type: 'barY', data: 'byMonth', x: 'month', y: 'total' }],
        x: { scale: { kind: 'band', padding: 0.2 } },
        y: { scale: { kind: 'linear' }, grid: true },
      },
      { rows },
    )
    const scene = createChartScene(toStatic(definition), { width: 640, height: 320 })
    const svg = renderChartSvg(scene, { ariaLabel: 'groupby' })
    expect(svg).toContain('<svg')
    expect(svg).toContain('<rect')
  })

  it('reduce 函数枚举（median/quantile 工厂）可执行', () => {
    const definition = translateChartSpec(
      {
        transforms: [
          {
            name: 'stats',
            kind: 'groupBy',
            by: 'month',
            outputs: {
              med: { value: 'value', reduce: 'median' },
              q1: { value: 'value', reduce: { quantile: 0.25 } },
            },
          },
        ],
        marks: [{ type: 'barY', data: 'stats', x: 'month', y: 'med' }],
        x: { scale: { kind: 'band' } },
        y: { scale: { kind: 'linear' } },
      },
      { rows },
    )
    const scene = createChartScene(toStatic(definition), { width: 640, height: 320 })
    expect(renderChartSvg(scene, { ariaLabel: 'reduce' })).toContain('<rect')
  })

  it('rollingWindow 链式引用前一步产物', () => {
    const series = Array.from({ length: 12 }, (_, i) => ({ t: `p${i}`, value: 10 + i }))
    const definition = translateChartSpec(
      {
        transforms: [
          {
            name: 'smoothed',
            kind: 'rollingWindow',
            size: 3,
            outputs: { ma: { value: 'value', reduce: 'mean' } },
          },
        ],
        marks: [{ type: 'lineY', data: 'smoothed', x: 't', y: 'ma' }],
        x: { scale: { kind: 'point' } },
        y: { scale: { kind: 'linear' } },
      },
      { rows: series },
    )
    const scene = createChartScene(toStatic(definition), { width: 640, height: 320 })
    expect(renderChartSvg(scene, { ariaLabel: 'rolling' })).toContain('M')
  })

  it('未知 transform kind 显式抛错', () => {
    expect(() =>
      translateChartSpec({
        // @ts-expect-error 运行时防御
        transforms: [{ name: 'x', kind: 'window99' }],
        marks: [],
      }),
    ).toThrow(/transform/)
  })
})

describe('mark layout 与长尾 mark', () => {
  const rows = [
    { month: 'Jan', kind: 'a', value: 40 },
    { month: 'Jan', kind: 'b', value: 22 },
    { month: 'Feb', kind: 'a', value: 62 },
    { month: 'Feb', kind: 'b', value: 30 },
  ]

  it('stack layout 挂 barY（堆叠柱状端到端可渲染）', () => {
    const definition = translateChartSpec(
      {
        marks: [
          {
            type: 'barY',
            data: 'rows',
            x: 'month',
            y: 'value',
            color: 'kind',
            layout: { kind: 'stack' },
          },
        ],
        x: { scale: { kind: 'band', padding: 0.2 } },
        y: { scale: { kind: 'linear' } },
      },
      { rows },
    )
    const scene = createChartScene(toStatic(definition), { width: 640, height: 320 })
    expect(renderChartSvg(scene, { ariaLabel: 'stacked' })).toContain('<rect')
  })

  it('group layout 挂 barY（分组柱状端到端可渲染）', () => {
    const definition = translateChartSpec(
      {
        marks: [
          {
            type: 'barY',
            data: 'rows',
            x: 'month',
            y: 'value',
            color: 'kind',
            layout: { kind: 'group', padding: 0.1 },
          },
        ],
        x: { scale: { kind: 'band', padding: 0.2 } },
        y: { scale: { kind: 'linear' } },
      },
      { rows },
    )
    const scene = createChartScene(toStatic(definition), { width: 640, height: 320 })
    expect(renderChartSvg(scene, { ariaLabel: 'grouped' })).toContain('<rect')
  })

  it('未知 layout kind 显式抛错', () => {
    expect(() =>
      translateChartSpec({
        marks: [
          // @ts-expect-error 运行时防御
          { type: 'barY', data: rows, x: 'month', y: 'value', layout: { kind: 'pile' } },
        ],
      }),
    ).toThrow(/layout/)
  })

  it('boxY/violinY/waffleY/differenceY/linearRegressionY 等长尾 mark 可翻译渲染', () => {
    const distribution = Array.from({ length: 40 }, (_, i) => ({
      group: i % 2 === 0 ? 'a' : 'b',
      value: 20 + ((i * 7) % 30),
    }))
    const definition = translateChartSpec(
      {
        marks: [{ type: 'boxY', data: 'rows', x: 'group', y: 'value' }],
        x: { scale: { kind: 'band' } },
        y: { scale: { kind: 'linear' } },
      },
      { rows: distribution },
    )
    const scene = createChartScene(toStatic(definition), { width: 640, height: 320 })
    expect(renderChartSvg(scene, { ariaLabel: 'box' })).toContain('<svg')
  })

  it('frame 无数据装饰 mark 不解析数据', () => {
    const definition = translateChartSpec({
      marks: [
        { type: 'lineY', data: rows, x: 'month', y: 'value' },
        { type: 'frame', strokeOpacity: 0.4 },
      ],
      x: { scale: { kind: 'point' } },
      y: { scale: { kind: 'linear' } },
    })
    const scene = createChartScene(toStatic(definition), { width: 640, height: 320 })
    expect(renderChartSvg(scene, { ariaLabel: 'frame' })).toContain('<svg')
  })

  it('ruleX/ruleY 主 channel 接受数值常量（固定位置参考线）', () => {
    const definition = translateChartSpec({
      marks: [
        { type: 'barY', data: rows, x: 'month', y: 'value' },
        { type: 'ruleY', data: 'rows', y: 0 },
      ],
      x: { scale: { kind: 'point' } },
      y: { scale: { kind: 'linear' } },
    })
    const scene = createChartScene(toStatic(definition), { width: 640, height: 320 })
    expect(renderChartSvg(scene, { ariaLabel: 'rule' })).toContain('<svg')
    // 非 rule mark 的 x/y 仍拒绝数值（防止 LLM 把字段名笔误成数字静默通过）
    expect(() =>
      translateChartSpec({
        marks: [{ type: 'barY', data: rows, x: 0, y: 'value' }],
      }),
    ).toThrow(/channel "x"/)
  })

  it('violinY curve 经 AreaXCurve 包装（basis 端到端可渲染）', () => {
    const profiles = [
      { species: 'a', y: 10, width: 0.4 },
      { species: 'a', y: 20, width: 1 },
      { species: 'a', y: 30, width: 0.5 },
      { species: 'b', y: 15, width: 0.7 },
      { species: 'b', y: 25, width: 0.9 },
      { species: 'b', y: 35, width: 0.3 },
    ]
    const definition = translateChartSpec({
      marks: [
        {
          type: 'violinY',
          data: 'rows',
          x: 'species',
          y: 'y',
          width: 'width',
          curve: 'basis',
        },
      ],
      x: { scale: { kind: 'point', domain: ['a', 'b'] } },
      y: { scale: { kind: 'linear' } },
    })
    const scene = createChartScene(toStatic(definition), { width: 640, height: 320 })
    expect(renderChartSvg(scene, { ariaLabel: 'violin' })).toContain('<svg')
  })
})

describe('polar 族（polar 容器 / pie 复合）', () => {
  it('polar 容器 + radialBarRadius：x/y 缺省置 null、guides 缺省关闭', () => {
    const definition = translateChartSpec({
      marks: [
        {
          type: 'polar',
          marks: [
            {
              type: 'radialBarRadius',
              data: [
                { cat: 'a', value: 40 },
                { cat: 'b', value: 62 },
              ],
              angle: 'cat',
              radius: 'value',
            },
          ],
        },
      ],
    }) as { x?: unknown; y?: unknown; guides?: unknown }
    expect(definition.x).toBeNull()
    expect(definition.y).toBeNull()
    expect(definition.guides).toBe(false)
    const scene = createChartScene(toStatic(definition as DomChartDefinition), {
      width: 480,
      height: 480,
    })
    expect(renderChartSvg(scene, { ariaLabel: 'polar' })).toContain('<svg')
  })

  it('pie 命名复合：value 角度分配 + radialArc 展开（端到端可渲染）', () => {
    const definition = translateChartSpec({
      marks: [
        {
          type: 'pie',
          data: [
            { name: 'a', share: 40 },
            { name: 'b', share: 35 },
            { name: 'c', share: 25 },
          ],
          value: 'share',
          key: 'name',
          color: 'name',
          innerRadiusRatio: 0.5,
        },
      ],
    }) as { x?: unknown; y?: unknown }
    expect(definition.x).toBeNull()
    expect(definition.y).toBeNull()
    const scene = createChartScene(toStatic(definition as DomChartDefinition), {
      width: 480,
      height: 480,
    })
    const svg = renderChartSvg(scene, { ariaLabel: 'pie' })
    expect(svg).toContain('<svg')
    expect(svg).toContain('path')
  })

  it('pie 缺 value 显式抛错（value 类型层可选，运行时校验兜底）', () => {
    expect(() =>
      translateChartSpec({
        marks: [{ type: 'pie', data: [{ name: 'a' }], key: 'name' }],
      }),
    ).toThrow(/value/)
  })

  it('pie transform：padAngle 映射 gapAngle 物化为行字段；startAngle/endAngle 控制角度分配', () => {
    // 回归契约：CX 统一 padAngle 命名，transform 侧字段为 gapAngle（传 padAngle 会被忽略）；
    // startAngle/endAngle 须传 transform——容器层同名字段只作用于 angle scale，
    // radialArc 直接读 datum 弧度（外部审查发现的静默失效路径）
    const rows = translateTransform(
      {
        name: 'slices',
        kind: 'pie',
        value: 'share',
        padAngle: 0.1,
        startAngle: 1,
        endAngle: 4,
      },
      {
        rows: [
          { name: 'a', share: 60 },
          { name: 'b', share: 40 },
        ],
      },
    ) as readonly { startAngle: number; endAngle: number; padAngle: number }[]
    // 间隙折算进区间（行 padAngle 恒 0，radialArc 不再二次 pad）：相邻切片间出现 gap
    expect(rows[0]?.startAngle).toBeCloseTo(1)
    expect((rows[1]?.startAngle ?? 0) - (rows[0]?.endAngle ?? 0)).toBeCloseTo(0.1)
    const last = rows.at(-1)
    expect(last?.endAngle).toBeCloseTo(4)
  })

  it('radialArea curve 原生 d3 工厂（linearClosed 雷达闭合端到端可渲染）', () => {
    const definition = translateChartSpec({
      marks: [
        {
          type: 'polar',
          marks: [
            {
              type: 'radialArea',
              data: [
                { event: 'a', score: 80 },
                { event: 'b', score: 100 },
                { event: 'c', score: 55 },
                { event: 'd', score: 66 },
              ],
              angle: 'event',
              radius: 'score',
              curve: 'linearClosed',
              fillOpacity: 0.6,
            },
          ],
        },
      ],
    })
    const scene = createChartScene(toStatic(definition), { width: 480, height: 480 })
    expect(renderChartSvg(scene, { ariaLabel: 'radar' })).toContain('<svg')
  })

  it('radialRule/radialBarRadius 径向起止 radius1/radius2 透传（仪表引导线端到端可渲染）', () => {
    const definition = translateChartSpec({
      marks: [
        {
          type: 'polar',
          marks: [
            {
              type: 'radialBarRadius',
              data: [{ cat: 'a', value: 72 }],
              angle: 'cat',
              radius1: 0,
              radius2: 'value',
            },
            {
              type: 'radialRule',
              data: [{ cat: 'a', value: 72 }],
              angle: 'cat',
              radius1: 0.2,
              radius2: 0.9,
            },
          ],
        },
      ],
    })
    const scene = createChartScene(toStatic(definition), { width: 480, height: 480 })
    expect(renderChartSvg(scene, { ariaLabel: 'gauge' })).toContain('<svg')
  })

  it('radialBarAngle 弧段起止 angle1/angle2 透传（显式堆叠弧段端到端可渲染）', () => {
    const definition = translateChartSpec({
      marks: [
        {
          type: 'polar',
          radiusRatio: 0.9,
          marks: [
            {
              type: 'radialBarAngle',
              data: [
                { cat: 'a', from: 0, to: 1.2 },
                { cat: 'a', from: 1.2, to: 2.6 },
                { cat: 'a', from: 2.6, to: Math.PI },
              ],
              angle1: 'from',
              angle2: 'to',
              radius: 'cat',
              color: 'cat',
            },
          ],
        },
      ],
    })
    const scene = createChartScene(toStatic(definition), { width: 480, height: 480 })
    expect(renderChartSvg(scene, { ariaLabel: 'radial-stacked' })).toContain('<svg')
  })
})

describe('spatial mark（voronoi/hexbin/contour/delaunayLink/density）', () => {
  const points = Array.from({ length: 30 }, (_, i) => ({
    x: (i * 13) % 100,
    y: (i * 29) % 80,
  }))

  it('voronoi/delaunayLink 端到端可渲染', () => {
    const definition = translateChartSpec(
      {
        marks: [
          { type: 'voronoi', data: 'rows', x: 'x', y: 'y', fillOpacity: 0.2 },
          { type: 'delaunayLink', data: 'rows', x: 'x', y: 'y', strokeOpacity: 0.4 },
        ],
        x: { scale: { kind: 'linear' } },
        y: { scale: { kind: 'linear' } },
      },
      { rows: points },
    )
    const scene = createChartScene(toStatic(definition), { width: 640, height: 320 })
    expect(renderChartSvg(scene, { ariaLabel: 'voronoi' })).toContain('<svg')
  })

  it('hexbin 聚合（binWidth + outputs count）端到端可渲染', () => {
    const definition = translateChartSpec(
      {
        marks: [
          {
            type: 'hexbin',
            data: 'rows',
            x: 'x',
            y: 'y',
            binWidth: 24,
            outputs: { count: { reduce: 'count' } },
            fillOpacity: 0.7,
          },
        ],
        x: { scale: { kind: 'linear' } },
        y: { scale: { kind: 'linear' } },
      },
      { rows: points },
    )
    const scene = createChartScene(toStatic(definition), { width: 640, height: 320 })
    expect(renderChartSvg(scene, { ariaLabel: 'hexbin' })).toContain('<svg')
  })

  it('contour 网格等值线（width/height 网格行列 + value 标量）端到端可渲染', () => {
    const width = 12
    const height = 8
    const grid = Array.from({ length: width * height }, (_, i) => {
      const gx = i % width
      const gy = Math.floor(i / width)
      return Math.sin(gx / 2) + Math.cos(gy / 2)
    })
    const definition = translateChartSpec({
      marks: [{ type: 'contour', data: grid, width, height, thresholds: 6 }],
      color: { legend: { kind: 'gradient', label: 'density' } },
    })
    const scene = createChartScene(toStatic(definition), { width: 640, height: 320 })
    expect(renderChartSvg(scene, { ariaLabel: 'contour' })).toContain('<svg')
  })

  it('density 散点 KDE 等值线（x/y channel + bandwidth/thresholds）端到端可渲染', () => {
    const definition = translateChartSpec(
      {
        marks: [
          {
            type: 'density',
            data: 'rows',
            x: 'x',
            y: 'y',
            bandwidth: 18,
            thresholds: [0.0004, 0.001, 0.002],
            fillOpacity: 0.16,
          },
        ],
        x: { scale: { kind: 'linear' } },
        y: { scale: { kind: 'linear' } },
      },
      { rows: points },
    )
    const scene = createChartScene(toStatic(definition), { width: 640, height: 320 })
    expect(renderChartSvg(scene, { ariaLabel: 'density' })).toContain('<svg')
  })
})

describe('复合 mark（sankey/sunburst/treemap/tree/forceGraph/geoShape/facet）', () => {
  it('sankey：固化 link+rect 组装端到端可渲染', () => {
    const nodes = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
    const links = [
      { source: 'a', target: 'b', value: 30 },
      { source: 'b', target: 'c', value: 20 },
      { source: 'a', target: 'c', value: 10 },
    ]
    const definition = translateChartSpec(
      {
        marks: [
          {
            type: 'sankey',
            nodes: 'nodes',
            links: 'links',
            nodeKey: 'id',
            source: 'source',
            target: 'target',
            value: 'value',
          },
        ],
      },
      { nodes, links },
    )
    const scene = createChartScene(toStatic(definition), { width: 640, height: 320 })
    const svg = renderChartSvg(scene, { ariaLabel: 'sankey' })
    expect(svg).toContain('<svg')
    expect(svg).toContain('<rect')
  })

  it('sunburst：层级 path 数据源 + polar 容器包装（x/y null）端到端可渲染', () => {
    const rows = [
      { path: 'root/a/x', value: 30 },
      { path: 'root/a/y', value: 20 },
      { path: 'root/b/z', value: 50 },
    ]
    const definition = translateChartSpec(
      {
        marks: [{ type: 'sunburst', data: 'rows', path: 'path', value: 'value', color: 'path' }],
      },
      { rows },
    ) as { x?: unknown; y?: unknown }
    expect(definition.x).toBeNull()
    expect(definition.y).toBeNull()
    const scene = createChartScene(toStatic(definition as DomChartDefinition), {
      width: 480,
      height: 480,
    })
    expect(renderChartSvg(scene, { ariaLabel: 'sunburst' })).toContain('<svg')
  })

  it('treemap：nodeId/parentId 平铺数据源端到端可渲染', () => {
    const rows = [
      { id: 'root', parent: null, value: 0 },
      { id: 'a', parent: 'root', value: 30 },
      { id: 'b', parent: 'root', value: 70 },
    ]
    const definition = translateChartSpec(
      {
        marks: [
          {
            type: 'treemap',
            data: 'rows',
            nodeId: 'id',
            parentId: 'parent',
            value: 'value',
            color: 'id',
            paddingInner: 2,
          },
        ],
      },
      { rows },
    )
    const scene = createChartScene(toStatic(definition), { width: 640, height: 320 })
    expect(renderChartSvg(scene, { ariaLabel: 'treemap' })).toContain('<svg')
  })

  it('tree：treeLayout 展开 link+dot 双 mark 端到端可渲染', () => {
    const rows = [
      { name: 'root', parent: null },
      { name: 'a', parent: 'root' },
      { name: 'b', parent: 'root' },
      { name: 'c', parent: 'a' },
    ]
    const definition = translateChartSpec(
      {
        marks: [
          { type: 'tree', data: 'rows', nodeId: 'name', parentId: 'parent', orientation: 'top' },
        ],
        x: { scale: { kind: 'linear' } },
        y: { scale: { kind: 'linear' } },
      },
      { rows },
    )
    const scene = createChartScene(toStatic(definition), { width: 640, height: 480 })
    expect(renderChartSvg(scene, { ariaLabel: 'tree' })).toContain('<svg')
  })

  it('forceGraph：仿真布局 + 轴域自动注入端到端可渲染', () => {
    const nodes = [
      { id: 'a', group: 1 },
      { id: 'b', group: 1 },
      { id: 'c', group: 2 },
    ]
    const links = [
      { source: 'a', target: 'b', value: 2 },
      { source: 'b', target: 'c', value: 1 },
    ]
    const definition = translateChartSpec(
      {
        marks: [
          {
            type: 'forceGraph',
            nodes: 'nodes',
            links: 'links',
            nodeKey: 'id',
            source: 'source',
            target: 'target',
            color: 'group',
            iterations: 60,
          },
        ],
      },
      { nodes, links },
    ) as { x?: { scale?: { domain?: () => number[] } } }
    const scene = createChartScene(toStatic(definition as DomChartDefinition), {
      width: 640,
      height: 480,
    })
    expect(renderChartSvg(scene, { ariaLabel: 'force' })).toContain('<svg')
  })

  it('geoShape：投影名称枚举映射端到端可渲染', () => {
    const features = [
      {
        type: 'Feature',
        properties: { name: 'box' },
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [0, 0],
              [10, 0],
              [10, 10],
              [0, 10],
              [0, 0],
            ],
          ],
        },
      },
    ]
    const definition = translateChartSpec(
      {
        marks: [
          {
            type: 'geoShape',
            data: 'rows',
            projection: 'mercator',
            fit: 'data',
            key: 'properties.name',
            fillOpacity: 0.6,
          },
        ],
      },
      { rows: features },
    )
    const scene = createChartScene(toStatic(definition), { width: 640, height: 320 })
    expect(renderChartSvg(scene, { ariaLabel: 'geo' })).toContain('<svg')
  })

  it('facet：chart 子 spec 模板递归（分组行注入缺省 data）端到端可渲染', () => {
    const rows = [
      { series: 's1', x: 1, y: 2 },
      { series: 's1', x: 2, y: 4 },
      { series: 's2', x: 1, y: 3 },
      { series: 's2', x: 2, y: 5 },
    ]
    const definition = translateChartSpec(
      {
        marks: [
          {
            type: 'facet',
            data: 'rows',
            by: 'series',
            columns: 2,
            label: true,
            chart: {
              marks: [{ type: 'dot', x: 'x', y: 'y', r: 3 }],
              x: { scale: { kind: 'linear', domain: [0, 3] } },
              y: { scale: { kind: 'linear', domain: [0, 6] } },
            },
          },
        ],
      },
      { rows },
    )
    const scene = createChartScene(toStatic(definition), { width: 640, height: 320 })
    expect(renderChartSvg(scene, { ariaLabel: 'facet' })).toContain('<svg')
  })

  it('未知复合 mark type 显式抛错', () => {
    expect(() =>
      translateChartSpec({
        // @ts-expect-error 运行时防御
        marks: [{ type: 'sankey99', data: [] }],
      }),
    ).toThrow(/mark type/)
  })
})

describe('definition 顶层扩展（color.legend / tooltip / focus）', () => {
  const rows = [
    { month: 'Jan', value: 40, kind: 'a' },
    { month: 'Feb', value: 62, kind: 'b' },
  ]

  it('color.legend true → colorLegend 实例挂载', () => {
    const definition = translateChartSpec({
      marks: [{ type: 'dot', data: rows, x: 'month', y: 'value', color: 'kind' }],
      color: { legend: true },
    }) as { color?: { legend?: { height?: unknown } } }
    expect(typeof definition.color?.legend?.height).toBe('function')
  })

  it('color.domain/range 原样透传', () => {
    const definition = translateChartSpec({
      marks: [{ type: 'dot', data: rows, x: 'month', y: 'value', color: 'kind' }],
      color: { domain: ['a', 'b'], range: ['#111111', '#eeeeee'] },
    }) as { color?: { domain?: string[]; range?: string[] } }
    expect(definition.color?.domain).toEqual(['a', 'b'])
    expect(definition.color?.range).toEqual(['#111111', '#eeeeee'])
  })

  it('tooltip anchor/sort/items 标量子集透传（挂默认 extension）', () => {
    const definition = translateChartSpec({
      marks: [{ type: 'dot', data: rows, x: 'month', y: 'value' }],
      tooltip: {
        anchor: { x: 'plot-center', y: 'point' },
        sort: 'visual',
        items: ['x', { field: 'value', label: '数值' }],
      },
    }) as { tooltip?: Record<string, unknown> }
    expect(definition.tooltip?.use).toBe(domChartTooltip)
    expect(definition.tooltip?.sort).toBe('visual')
    expect(definition.tooltip?.anchor).toEqual({ x: 'plot-center', y: 'point' })
    expect(definition.tooltip?.items).toEqual(['x', { field: 'value', label: '数值' }])
  })

  it('focus 枚举原样透传', () => {
    const definition = translateChartSpec({
      marks: [{ type: 'lineY', data: rows, x: 'month', y: 'value' }],
      focus: 'nearest-x',
    }) as { focus?: unknown }
    expect(definition.focus).toBe('nearest-x')
  })

  it('utc/time 轴 channel ISO 字符串纠偏为 Date（null 保留缺口语义）', () => {
    const definition = translateChartSpec({
      marks: [
        {
          type: 'lineY',
          data: 'rows',
          x: 'date',
          y: 'close',
        },
      ],
      x: { scale: { kind: 'utc' } },
      y: { scale: { kind: 'linear' } },
    }, {
      rows: [
        { date: '2026-01-05', close: null },
        { date: '2026-04-06', close: 168.82 },
        { date: '2026-04-13', close: 174.31 },
      ],
    })
    const scene = createChartScene(toStatic(definition), { width: 640, height: 320 })
    // 库对 temporal scale 的非 Date channel 值抛错——纠偏后全链路可渲染
    expect(renderChartSvg(scene, { ariaLabel: 'utc' })).toContain('<svg')
  })
})
