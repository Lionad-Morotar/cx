import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import { CxTanstackCharts, CxTanstackChartsBundle } from '../src/index'

/**
 * TanStack Charts 物料契约（_cx_meta + _cx_install + key 前缀唯一）+ 通用 chart 挂载 smoke。
 * comp 为 cx 运行时节点桩（渲染器实际注入含 id/key/data 的对象，桥接层负责剥离）。
 * Chart 组件 SSR 形态（prerender innerHTML 直出）使 happy-dom 可断言 svg 非空——
 * ResizeObserver 在 renderer.ts 有存在性守卫，缺席时优雅跳过。
 */
const fakeComp = (key: string) => ({ id: `test-${key}`, key, data: {}, components: {} })

const mountMaterial = (comp: any, props: Record<string, any> = {}) =>
  mount(comp, {
    props: { comp: fakeComp(comp._cx_meta?.key || 'x'), ...props },
  })

const byKey = (key: string) => CxTanstackCharts.find((x: any) => x._cx_meta.key === key)!

describe('TanStack Charts 物料契约', () => {
  it('bundle 自描述：name 为 tanstack-charts，materials 与 CxTanstackCharts 一致', () => {
    expect(CxTanstackChartsBundle.name).toBe('tanstack-charts')
    expect(CxTanstackChartsBundle.materials).toHaveLength(CxTanstackCharts.length)
  })

  it('每个物料带 _cx_meta + _cx_install，key 唯一（通用图表短 key cx-chart，预设 cx-tanstack-charts- 前缀）', () => {
    const keys = new Set<string>()
    for (const m of CxTanstackCharts as any[]) {
      expect(m._cx_meta).toBeTruthy()
      expect(typeof m._cx_install).toBe('function')
      expect(m._cx_meta.key).toMatch(/^(cx-chart|cx-tanstack-charts-[a-z0-9-]+)$/)
      keys.add(m._cx_meta.key)
    }
    expect(keys.size).toBe(CxTanstackCharts.length)
  })
})

describe('cx-chart 挂载 smoke', () => {
  const lineSpec = {
    marks: [
      {
        type: 'lineY',
        data: [
          { month: 'Jan', value: 40 },
          { month: 'Feb', value: 62 },
        ],
        x: 'month',
        y: 'value',
      },
    ],
    x: { scale: { kind: 'point' } },
    y: { scale: { kind: 'linear' } },
  }

  it('JSON definition 经翻译层渲染出 svg（宿主 div + svg 非空）', () => {
    const wrapper = mountMaterial(byKey('cx-chart'), { definition: lineSpec })
    expect(wrapper.find('.ts-chart-host').exists()).toBe(true)
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('ariaLabel 缺省回退物料中文名，显式配置优先（落在 svg 元素上）', () => {
    const fallback = mountMaterial(byKey('cx-chart'), { definition: lineSpec })
    expect(fallback.find('svg').attributes('aria-label')).toBe('图表')
    const explicit = mountMaterial(byKey('cx-chart'), {
      definition: lineSpec,
      ariaLabel: '销售趋势',
    })
    expect(explicit.find('svg').attributes('aria-label')).toBe('销售趋势')
  })

  it('cx 内部键（comp/data-*）不泄漏到宿主 div 属性', () => {
    const wrapper = mountMaterial(byKey('cx-chart'), {
      definition: lineSpec,
      'data-cx-comp-id': 'x1',
    })
    const attrs = wrapper.find('.ts-chart-host').attributes()
    expect(attrs.comp).toBeUndefined()
    expect(attrs['data-cx-comp-id']).toBeUndefined()
  })
})

describe('cx-chart 流式骨架', () => {
  const lineSpec = {
    marks: [{ type: 'lineY', data: [{ month: 'Jan', value: 40 }], x: 'month', y: 'value' }],
    x: { scale: { kind: 'point' } },
    y: { scale: { kind: 'linear' } },
  }

  it('definition 未闭合（_cx_streaming 含 definition）渲染骨架而非空 svg', () => {
    const wrapper = mountMaterial(byKey('cx-chart'), {
      definition: { marks: [] },
      _cx_streaming: ['definition'],
    })
    const skeleton = wrapper.find('[data-testid=cx-tanstack-charts-chart-skeleton]')
    expect(skeleton.exists()).toBe(true)
    expect(skeleton.attributes('aria-hidden')).toBe('true')
    // 骨架与物料互斥替换：空壳期不渲染 Chart（空 svg 无可见元素，等同无反馈）
    expect(wrapper.find('svg').exists()).toBe(false)
  })

  it('骨架高度跟随 height prop（揭示瞬间无布局跳动），缺省回退 320', () => {
    const explicit = mountMaterial(byKey('cx-chart'), {
      definition: { marks: [] },
      height: 240,
      _cx_streaming: ['definition'],
    })
    expect(
      explicit.find('[data-testid=cx-tanstack-charts-chart-skeleton]').attributes('style'),
    ).toContain('240px')
    const fallback = mountMaterial(byKey('cx-chart'), {
      definition: { marks: [] },
      _cx_streaming: ['definition'],
    })
    expect(
      fallback.find('[data-testid=cx-tanstack-charts-chart-skeleton]').attributes('style'),
    ).toContain('320px')
  })

  it('无流式标记时骨架不在场、图表直渲（标记消失即揭示）', () => {
    const wrapper = mountMaterial(byKey('cx-chart'), { definition: lineSpec })
    expect(wrapper.find('[data-testid=cx-tanstack-charts-chart-skeleton]').exists()).toBe(false)
    expect(wrapper.find('svg').exists()).toBe(true)
  })
})

describe('cx-chart 数据顶层化（GenUI 契约）', () => {
  it('rows 顶层数据集 + marks 字符串引用渲染出数据路径', () => {
    const wrapper = mountMaterial(byKey('cx-chart'), {
      definition: {
        marks: [{ type: 'lineY', data: 'rows', x: 'month', y: 'value' }],
        x: { scale: { kind: 'point' } },
        y: { scale: { kind: 'linear' } },
      },
      rows: [
        { month: 'Jan', value: 40 },
        { month: 'Feb', value: 62 },
      ],
    })
    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.find('svg').html()).toContain('M')
  })

  it('rows 缺席（definition 先闭合的流式中间态）渲染宿主坐标系、不抛错、无骨架', () => {
    const wrapper = mountMaterial(byKey('cx-chart'), {
      definition: {
        marks: [{ type: 'lineY', data: 'rows', x: 'month', y: 'value' }],
        x: { scale: { kind: 'point' } },
        y: { scale: { kind: 'linear' } },
      },
    })
    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.find('[data-testid=cx-tanstack-charts-chart-skeleton]').exists()).toBe(false)
  })

  it('命名数据集表：nodes/links 并存引用（关系型图契约）', () => {
    const wrapper = mountMaterial(byKey('cx-chart'), {
      definition: {
        marks: [
          { type: 'rect', data: 'nodes', x1: 'x0', x2: 'x1', y1: 'y0', y2: 'y1' },
          { type: 'dot', data: 'links', x: 'mx', y: 'my' },
        ],
        x: { scale: { kind: 'linear' } },
        y: { scale: { kind: 'linear' } },
      },
      nodes: [{ x0: 0, x1: 1, y0: 0, y1: 2 }],
      links: [{ mx: 0.5, my: 1 }],
    })
    expect(wrapper.find('svg').exists()).toBe(true)
  })
})
