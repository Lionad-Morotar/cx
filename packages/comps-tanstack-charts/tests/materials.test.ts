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

  it('每个物料带 _cx_meta + _cx_install，key 唯一且匹配 cx-tanstack-charts- 前缀', () => {
    const keys = new Set<string>()
    for (const m of CxTanstackCharts as any[]) {
      expect(m._cx_meta).toBeTruthy()
      expect(typeof m._cx_install).toBe('function')
      expect(m._cx_meta.key).toMatch(/^cx-tanstack-charts-[a-z0-9-]+$/)
      keys.add(m._cx_meta.key)
    }
    expect(keys.size).toBe(CxTanstackCharts.length)
  })
})

describe('cx-tanstack-charts-chart 挂载 smoke', () => {
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
    const wrapper = mountMaterial(byKey('cx-tanstack-charts-chart'), { definition: lineSpec })
    expect(wrapper.find('.ts-chart-host').exists()).toBe(true)
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('ariaLabel 缺省回退物料中文名，显式配置优先（落在 svg 元素上）', () => {
    const fallback = mountMaterial(byKey('cx-tanstack-charts-chart'), { definition: lineSpec })
    expect(fallback.find('svg').attributes('aria-label')).toBe('图表')
    const explicit = mountMaterial(byKey('cx-tanstack-charts-chart'), {
      definition: lineSpec,
      ariaLabel: '销售趋势',
    })
    expect(explicit.find('svg').attributes('aria-label')).toBe('销售趋势')
  })

  it('cx 内部键（comp/data-*）不泄漏到宿主 div 属性', () => {
    const wrapper = mountMaterial(byKey('cx-tanstack-charts-chart'), {
      definition: lineSpec,
      'data-cx-comp-id': 'x1',
    })
    const attrs = wrapper.find('.ts-chart-host').attributes()
    expect(attrs.comp).toBeUndefined()
    expect(attrs['data-cx-comp-id']).toBeUndefined()
  })
})
