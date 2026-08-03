import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import type { ThemePreference } from '../app/standup/states/theme'

/**
 * 主题开关物料的结构与行为验证。
 * color-mode 适配层经 vi.mock 替换为受控 ref（happy-dom 无 Nuxt 运行时），
 * UButton 以透传 attrs 的 button stub 呈现，断言走 DOM 结构而非计算样式。
 */

// hoisted 早于模块 import 执行，受控 ref 须在其内部动态取 vue
const { prefRef } = await vi.hoisted(async () => {
  const { ref } = await import('vue')
  return { prefRef: ref<ThemePreference>('light') }
})

vi.mock('../app/standup/states/color-mode-adapter', () => ({
  useColorModePreference: () => prefRef,
}))

const { default: ThemeToggle } = await import('../app/standup/components/theme-toggle/theme-toggle.vue')

// stub 只透传 attrs：父组件的 @click 本就以 onClick 落在 $attrs 里，
// 原生 click 直接触发它；若再 $emit('click') 会双触发导致状态跳两级
const mountToggle = () =>
  mount(ThemeToggle, {
    global: {
      stubs: {
        UButton: { template: '<button v-bind="$attrs"><slot/></button>' },
        UIcon: { template: '<i/>' },
      },
    },
  })

describe('主题开关物料', () => {
  it('渲染按钮并携带当前主题的 aria-label', () => {
    prefRef.value = 'light'
    const wrapper = mountToggle()
    const button = wrapper.find('[data-testid="theme-toggle"]')
    expect(button.exists()).toBe(true)
    expect(button.attributes('aria-label')).toContain('浅色')
  })

  it('点击循环推进 color-mode preference：浅色 → 深色 → 跟随系统 → 浅色', async () => {
    prefRef.value = 'light'
    const wrapper = mountToggle()
    const button = wrapper.find('[data-testid="theme-toggle"]')

    await button.trigger('click')
    expect(prefRef.value).toBe('dark')
    expect(button.attributes('aria-label')).toContain('深色')

    await button.trigger('click')
    expect(prefRef.value).toBe('system')
    expect(button.attributes('aria-label')).toContain('跟随系统')

    await button.trigger('click')
    expect(prefRef.value).toBe('light')
    expect(button.attributes('aria-label')).toContain('浅色')
  })

  it('图标随主题切换：sun / moon / monitor', () => {
    const iconOf = (pref: ThemePreference) => {
      prefRef.value = pref
      return mountToggle()
        .find('[data-testid="theme-toggle"]')
        .attributes('data-icon')
    }

    expect(iconOf('light')).toBe('i-lucide-sun')
    expect(iconOf('dark')).toBe('i-lucide-moon')
    expect(iconOf('system')).toBe('i-lucide-monitor')
  })
})
