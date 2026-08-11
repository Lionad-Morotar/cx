import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import { CxTanstackCharts } from '../src/index'

/**
 * 饼图物料契约与 smoke：pie 变换 + polar(radialArc) 的物料级组合。
 * 与笛卡尔预设不同构——通道为 name/value（无 x/y 轴），innerRadiusRatio 标量
 * 在物料内转 ({radius}) => radius * ratio 函数（JSON 不可表达值的物料侧桥接）。
 */
const fakeComp = (key: string) => ({ id: `test-${key}`, key, data: {}, components: {} })

const byKey = (key: string) => CxTanstackCharts.find((x: any) => x._cx_meta.key === key)!

const PIE_KEY = 'cx-tanstack-charts-pie'

/** meta.props 初值展开（函数 initial 调用取值） */
const initialDataOf = (meta: any): Record<string, any> => {
  const data: Record<string, any> = {}
  for (const [key, prop] of Object.entries<any>(meta.props)) {
    data[key] = typeof prop.initial === 'function' ? prop.initial() : prop.initial
  }
  return data
}

describe('饼图物料契约', () => {
  it('bundle 六件：通用 chart + 四笛卡尔预设 + pie', () => {
    const keys = (CxTanstackCharts as any[]).map((m) => m._cx_meta.key)
    expect(keys).toContain(PIE_KEY)
    expect(CxTanstackCharts).toHaveLength(6)
  })

  it('initial 三元组自洽：name/value 字段名命中 data 行键', () => {
    const data = initialDataOf(byKey(PIE_KEY)._cx_meta)
    expect(Array.isArray(data.data)).toBe(true)
    expect(data.data.length).toBeGreaterThan(0)
    for (const row of data.data) {
      expect(row).toHaveProperty(data.name)
      expect(row).toHaveProperty(data.value)
    }
  })

  it('以 initial 数据挂载渲染扇区弧 path 非空', () => {
    const wrapper = mount(byKey(PIE_KEY), {
      props: { comp: fakeComp(PIE_KEY), ...initialDataOf(byKey(PIE_KEY)._cx_meta) },
    })
    expect(wrapper.find('.ts-chart-host').exists()).toBe(true)
    const arcs = wrapper.findAll('svg path[d^="M"]')
    expect(arcs.length).toBeGreaterThan(0)
  })

  it('innerRadiusRatio > 0 渲染环形（路径与实心饼不同）', () => {
    const data = initialDataOf(byKey(PIE_KEY)._cx_meta)
    const solid = mount(byKey(PIE_KEY), { props: { comp: fakeComp('a'), ...data } })
    const donut = mount(byKey(PIE_KEY), {
      props: { comp: fakeComp('b'), ...data, innerRadiusRatio: 0.58 },
    })
    expect(donut.find('svg path[d^="M"]').attributes('d')).not.toBe(
      solid.find('svg path[d^="M"]').attributes('d'),
    )
  })

  it('负值/非数值行被过滤，渲染不抛错（JSON 输入不受 TS 约束）', () => {
    const data = initialDataOf(byKey(PIE_KEY)._cx_meta)
    const dirty = [
      { name: '甲', value: 10 },
      { name: '乙', value: -5 },
      { name: '丙', value: 'oops' },
      { name: '丁', value: 20 },
    ]
    expect(() =>
      mount(byKey(PIE_KEY), { props: { comp: fakeComp('c'), ...data, data: dirty } }),
    ).not.toThrow()
    const wrapper = mount(byKey(PIE_KEY), { props: { comp: fakeComp('d'), ...data, data: dirty } })
    expect(wrapper.find('svg path[d^="M"]').exists()).toBe(true)
  })

  it('ariaLabel 落到 svg 元素上', () => {
    const wrapper = mount(byKey(PIE_KEY), {
      props: { comp: fakeComp(PIE_KEY), ...initialDataOf(byKey(PIE_KEY)._cx_meta) },
    })
    expect(wrapper.find('svg').attributes('aria-label')).toBe('占比饼图')
  })
})
