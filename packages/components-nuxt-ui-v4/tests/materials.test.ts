import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import { CxNuxtUIV4, CxNuxtUIV4Button } from '../src/index'

/**
 * v4 物料 normalize 契约：数量、key 唯一与官方命名约定、_cx_install 可注册。
 * U* 组件经 vite alias 替换为离线 stub（#components → src/shims/components.ts），
 * 物料层模板与 props/slots 透传真实执行；U* 真实渲染由 playground 验收页覆盖。
 */
const byKey = (key: string) => CxNuxtUIV4.find((x: any) => x._cx_meta.key === key)!

describe('Nuxt UI v4 物料 normalize 契约', () => {
  it('70 个物料全部带 _cx_meta 且 key 唯一（官方核心 6 分类全量对齐）', () => {
    expect(CxNuxtUIV4.length).toBe(70)
    const keys = CxNuxtUIV4.map((m: any) => m._cx_meta.key)
    expect(new Set(keys).size).toBe(70)
    for (const m of CxNuxtUIV4 as any[]) {
      expect(m._cx_meta).toBeTruthy()
      expect(typeof m._cx_install).toBe('function')
    }
  })

  it('key 全部采用官方组件名：无 v2 概念名残留', () => {
    const keys = CxNuxtUIV4.map((m: any) => m._cx_meta.key as string)
    expect(keys.every((k) => k.startsWith('cx-nuxt-ui-v4-'))).toBe(true)
    // v2 概念名黑名单（含 meter；dropdown/radio/navigation 需精确匹配防误伤官方名）
    const legacy = [
      'cx-nuxt-ui-v4-date-picker',
      'cx-nuxt-ui-v4-divider',
      'cx-nuxt-ui-v4-dropdown',
      'cx-nuxt-ui-v4-form-item',
      'cx-nuxt-ui-v4-navigation',
      'cx-nuxt-ui-v4-notification',
      'cx-nuxt-ui-v4-radio',
      'cx-nuxt-ui-v4-range',
      'cx-nuxt-ui-v4-toggle',
      'cx-nuxt-ui-v4-meter',
    ]
    for (const k of legacy) {
      expect(keys).not.toContain(k)
    }
    // 改名代表抽查
    expect(byKey('cx-nuxt-ui-v4-input-date')).toBeTruthy()
    expect(byKey('cx-nuxt-ui-v4-separator')).toBeTruthy()
    expect(byKey('cx-nuxt-ui-v4-toast')).toBeTruthy()
  })

  it('button 物料挂载：模板经 UButton stub 渲染', () => {
    const wrapper = mount(CxNuxtUIV4Button as any, {
      attrs: { label: '按钮' },
      global: {
        provide: { cx: undefined, 'is-cx-edit': false, 'is-cx-debug': false },
      },
    })
    expect(wrapper.find('.u-stub-UButton').exists()).toBe(true)
  })
})
