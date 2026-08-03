import { computed } from 'vue'

import type { Ref } from 'vue'

export type ThemePreference = 'light' | 'dark' | 'system'

/**
 * 主题循环顺序：浅色 → 深色 → 跟随系统。
 * system 放在最后而非最前：演示场景下访客更常主动指定明暗，
 * 「回到跟随系统」作为循环收尾更接近「还原默认」的心智。
 */
export const THEME_CYCLE_ORDER: ThemePreference[] = ['light', 'dark', 'system']

const THEME_LABELS: Record<ThemePreference, string> = {
  light: '浅色',
  dark: '深色',
  system: '跟随系统',
}

/**
 * 返回循环中的下一个主题偏好。
 * 未知偏好（color-mode 可能存在 theme 扩展值）视为从循环起点重新起步：
 * 先归位到 light 再取其后继，避免把非法值继续传递。
 */
export const nextThemePreference = (current: ThemePreference): ThemePreference => {
  const index = THEME_CYCLE_ORDER.indexOf(current)
  const base = index === -1 ? 0 : index
  return THEME_CYCLE_ORDER[(base + 1) % THEME_CYCLE_ORDER.length] ?? 'light'
}

/**
 * 主题循环状态机，与 color-mode 解耦：preference 经 ref 注入，
 * 物料层以 useColorMode().preference 接入即可复用全部逻辑与测试。
 */
export const useThemeCycle = (preference: Ref<ThemePreference>) => {
  const cycle = () => {
    preference.value = nextThemePreference(preference.value)
  }
  const label = computed(() => THEME_LABELS[preference.value] ?? THEME_LABELS.system)
  return { preference, cycle, label }
}
