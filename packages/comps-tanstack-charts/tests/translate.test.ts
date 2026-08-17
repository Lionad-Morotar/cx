import { describe, expect, it } from 'vitest'
import { createChartScene, renderChartSvg } from '@tanstack/charts'

import type { DomChartDefinition, StaticChartDefinition } from '@tanstack/charts'

import {
  translateChartSpec,
  translateCurve,
  translateScale,
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
    expect(() => translateScale({ kind: 'log' })).toThrow(/scale/)
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

  it('tooltip 三态：true 回落库默认、false 关闭、标量对象原样透传', () => {
    const base = { marks: [{ type: 'dot' as const, data: rows, x: 'month', y: 'value' }] }
    const asBool = (d: unknown) => (d as { tooltip?: unknown }).tooltip
    expect(asBool(translateChartSpec({ ...base, tooltip: true }))).toBeUndefined()
    expect(asBool(translateChartSpec({ ...base, tooltip: false }))).toBe(false)
    expect(
      asBool(translateChartSpec({ ...base, tooltip: { placement: 'top', offset: 8 } })),
    ).toEqual({
      placement: 'top',
      offset: 8,
    })
    expect(asBool(translateChartSpec(base))).toBeUndefined()
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
