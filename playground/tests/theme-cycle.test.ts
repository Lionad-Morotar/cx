import { describe, expect, it } from 'vitest'
import { ref } from 'vue'

import { nextThemePreference, useThemeCycle, THEME_CYCLE_ORDER } from '../app/standup/states/theme'

import type { ThemePreference } from '../app/standup/states/theme'

/**
 * 主题循环状态机：浅色 → 深色 → 跟随系统 → 浅色。
 * 纯逻辑与 color-mode 解耦（preference 经 ref 注入），保证 happy-dom 下可单测；
 * 物料层再把 useColorMode().preference 接入同一状态机。
 */

describe('nextThemePreference', () => {
  it('按 浅色 → 深色 → 跟随系统 的顺序循环', () => {
    expect(nextThemePreference('light')).toBe('dark')
    expect(nextThemePreference('dark')).toBe('system')
    expect(nextThemePreference('system')).toBe('light')
  })

  it('未知值回落到循环起点（浅色）', () => {
    expect(nextThemePreference('sepia' as ThemePreference)).toBe('dark')
  })
})

describe('useThemeCycle', () => {
  it('cycle 推进注入的 preference ref 并回环', () => {
    const preference = ref<ThemePreference>('light')
    const { cycle } = useThemeCycle(preference)

    cycle()
    expect(preference.value).toBe('dark')
    cycle()
    expect(preference.value).toBe('system')
    cycle()
    expect(preference.value).toBe('light')
  })

  it('label 随 preference 变化给出中文读法', () => {
    const preference = ref<ThemePreference>('light')
    const { label } = useThemeCycle(preference)

    expect(label.value).toBe('浅色')
    preference.value = 'dark'
    expect(label.value).toBe('深色')
    preference.value = 'system'
    expect(label.value).toBe('跟随系统')
  })

  it('循环顺序与导出的 THEME_CYCLE_ORDER 一致', () => {
    expect(THEME_CYCLE_ORDER).toEqual(['light', 'dark', 'system'])
  })
})
