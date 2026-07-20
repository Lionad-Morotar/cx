import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createApp } from 'vue'
import * as Materials from '../app/standup/components'

// 迁移物料的 normalize 契约：key 唯一、_cx_install 可注册、基础物料可渲染
const materialEntries = Object.entries(Materials).filter(
  ([, v]) => v && typeof v === 'object' && (v as { _cx_meta?: unknown })._cx_meta,
) as [
  string,
  {
    _cx_meta: { key: string; name?: string }
    _cx_install?: (app: ReturnType<typeof createApp>) => void
    name: string
  },
][]

describe('站会物料 normalize 契约', () => {
  it('32 个物料全部带 _cx_meta 且 key 唯一', () => {
    expect(materialEntries.length).toBe(32)
    const keys = materialEntries.map(([, m]) => m._cx_meta.key)
    expect(new Set(keys).size).toBe(32)
    keys.forEach((k) => expect(k).toMatch(/^cx-[a-z0-9-]+$/))
  })

  it('component.name 被 normalize 覆写为 key 的 PascalCase', () => {
    const pascal = (k: string) =>
      k
        .split('-')
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join('')
    materialEntries.forEach(([, m]) => {
      expect(m.name).toBe(pascal(m._cx_meta.key))
    })
  })

  it('全部物料的 _cx_install 可向应用实例注册', () => {
    const app = createApp({})
    materialEntries.forEach(([, m]) => {
      expect(m._cx_install).toBeTypeOf('function')
      m._cx_install?.(app)
    })
    // 注册后按 key 可解析回组件
    materialEntries.forEach(([, m]) => {
      expect(app.component(m._cx_meta.key)).toBeTruthy()
    })
  })
})

describe('基础物料渲染 smoke', () => {
  it('CxTimeCount 渲染时间文本', () => {
    const TimeCount = Materials.CxTimeCount as never
    const wrapper = mount(TimeCount, {
      props: { time: '2026-07-19 09:30:00', run: false },
    })
    expect(wrapper.text()).toContain('2026')
  })

  it('CxDashboardCard 渲染标题与默认插槽', () => {
    const DashboardCard = Materials.CxDashboardCard as never
    const wrapper = mount(DashboardCard, {
      props: { title: '看板' },
      slots: { default: '<div class="slot-body">内容</div>' },
    })
    expect(wrapper.text()).toContain('看板')
    expect(wrapper.find('.slot-body').exists()).toBe(true)
  })
})
