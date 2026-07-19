import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import { CxNuxtUI } from '../src/index'

/**
 * nuxt-ui 物料 smoke：代表性物料可挂载（vendored v2 组件经 shim 离线工作）。
 */
const byKey = (key: string) => CxNuxtUI.find((x: any) => x._cx_meta.key === key)!

/** 物料运行于 cx-render 时会收到运行时组件上下文，smoke 以最小桩注入 */
const fakeCmpt = (key: string) => ({ id: `test-${key}`, key, data: {}, components: {} })

const mountMaterial = (cmpt: any, props: Record<string, any> = {}, opts: Record<string, any> = {}) =>
  mount(cmpt, {
    props: { cmpt: fakeCmpt(cmpt._cx_meta?.key || 'x'), ...props },
    global: {
      directives: { cx: { mounted() {} } },
      provide: {
        cx: undefined,
        'is-cx-edit': false,
        'is-cx-debug': false,
      },
      ...opts,
    },
  })

describe('nuxt-ui 物料 smoke', () => {
  it('物料数量与 normalize 装配', () => {
    expect(CxNuxtUI.length).toBeGreaterThanOrEqual(40)
    for (const meta of CxNuxtUI) {
      expect(meta._cx_meta).toBeTruthy()
      expect(typeof (meta as any)._cx_install).toBe('function')
    }
  })

  it('cx-button 挂载（vendored UButton 离线渲染）', () => {
    const cmpt = byKey('cx-button')
    const wrapper = mountMaterial(cmpt, { label: '按钮', color: 'primary' })
    expect(wrapper.text()).toContain('按钮')
  })

  it('cx-badge 挂载', () => {
    const cmpt = byKey('cx-badge')
    const wrapper = mountMaterial(cmpt, {})
    expect(wrapper.exists()).toBe(true)
  })

  it('cx-alert 挂载', () => {
    const cmpt = byKey('cx-alert')
    const wrapper = mountMaterial(cmpt, { title: '提示' })
    expect(wrapper.exists()).toBe(true)
  })
})
