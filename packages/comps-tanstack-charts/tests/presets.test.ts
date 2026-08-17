import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import { CxTanstackCharts } from '../src/index'

/**
 * 预设物料（line/bar/area/dot）契约与 smoke：
 * - meta.props 的 initial 三元组（data 行键 / x 值 / y 值）自洽——initial 不参与运行时
 *   校验，漂移无任何报错，只能靠测试锁定（vtu 既有教训）；
 * - curve select 的 options 值集与翻译层曲线枚举一致（防双侧漂移）；
 * - 每预设以 initial 数据挂载渲染出 svg 非空。
 */
const fakeComp = (key: string) => ({ id: `test-${key}`, key, data: {}, components: {} })

const byKey = (key: string) => CxTanstackCharts.find((x: any) => x._cx_meta.key === key)!

const PRESET_KEYS = [
  'cx-tanstack-charts-line',
  'cx-tanstack-charts-bar',
  'cx-tanstack-charts-area',
  'cx-tanstack-charts-dot',
] as const

const CURVE_ENUM = ['linear', 'monotoneX', 'step', 'stepAfter', 'stepBefore', 'basis', 'natural']

/** meta.props 初值展开（函数 initial 调用取值），模拟 buildDefaultData 行为 */
const initialDataOf = (meta: any): Record<string, any> => {
  const data: Record<string, any> = {}
  for (const [key, prop] of Object.entries<any>(meta.props)) {
    data[key] = typeof prop.initial === 'function' ? prop.initial() : prop.initial
  }
  return data
}

describe('预设物料契约', () => {
  it('通用 chart 与四个笛卡尔预设在包内（全包计数由 pie 测试锁定）', () => {
    const keys = (CxTanstackCharts as any[]).map((m) => m._cx_meta.key)
    for (const key of ['cx-tanstack-charts-chart', ...PRESET_KEYS]) {
      expect(keys).toContain(key)
    }
  })

  it.each(PRESET_KEYS)('%s 的 initial 三元组自洽：x/y 字段名命中 data 行键', (key) => {
    const meta = byKey(key)._cx_meta
    const data = initialDataOf(meta)
    expect(Array.isArray(data.data)).toBe(true)
    expect(data.data.length).toBeGreaterThan(0)
    for (const row of data.data) {
      expect(row).toHaveProperty(data.x)
      expect(row).toHaveProperty(data.y)
    }
  })

  it.each([
    ['cx-tanstack-charts-line', 'path[d^="M"]'],
    ['cx-tanstack-charts-bar', 'rect'],
    ['cx-tanstack-charts-area', 'path[d^="M"]'],
    ['cx-tanstack-charts-dot', 'circle'],
  ] as const)('%s 以 initial 数据挂载渲染 svg 非空（特征元素 %s）', (key, signature) => {
    const meta = byKey(key)._cx_meta
    const wrapper = mount(byKey(key), {
      props: { comp: fakeComp(key), ...initialDataOf(meta) },
    })
    expect(wrapper.find('.ts-chart-host').exists()).toBe(true)
    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.find(`svg ${signature}`).exists()).toBe(true)
  })

  it.each(['cx-tanstack-charts-line', 'cx-tanstack-charts-area'])(
    '%s 的 curve select 值集与翻译层曲线枚举一致',
    (key) => {
      const meta = byKey(key)._cx_meta
      const values = (meta.props.curve.options as { value: string }[]).map((o) => o.value).sort()
      expect(values).toEqual([...CURVE_ENUM].sort())
    },
  )

  it('curve 通道透传进规格（line 显式 curve 影响路径形态）', () => {
    const meta = byKey('cx-tanstack-charts-line')._cx_meta
    const data = initialDataOf(meta)
    const monotone = mount(byKey('cx-tanstack-charts-line'), {
      props: { comp: fakeComp('a'), ...data, curve: 'monotoneX' },
    })
    const step = mount(byKey('cx-tanstack-charts-line'), {
      props: { comp: fakeComp('b'), ...data, curve: 'step' },
    })
    expect(monotone.find('svg path').attributes('d')).not.toBe(
      step.find('svg path').attributes('d'),
    )
  })

  it('非法 curve 值（流式半截字符串）被白名单拦截，渲染不抛错', () => {
    const meta = byKey('cx-tanstack-charts-line')._cx_meta
    const data = initialDataOf(meta)
    expect(() =>
      mount(byKey('cx-tanstack-charts-line'), {
        props: { comp: fakeComp('c'), ...data, curve: 'monot' },
      }),
    ).not.toThrow()
    const wrapper = mount(byKey('cx-tanstack-charts-line'), {
      props: { comp: fakeComp('d'), ...data, curve: 'monot' },
    })
    expect(wrapper.find('svg path').exists()).toBe(true)
  })
})
