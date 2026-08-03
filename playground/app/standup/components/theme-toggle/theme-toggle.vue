<!-- 主题开关：浅色 → 深色 → 跟随系统 循环，接入 color-mode preference -->
<template>
  <UButton
    class="cx-theme-toggle theme-toggle"
    variant="outline"
    :icon="iconName"
    :data-icon="iconName"
    :aria-label="ariaLabel"
    :title="ariaLabel"
    data-testid="theme-toggle"
    @click="cycle"
  />
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import { useThemeCycle } from '../../states/theme'
import { useColorModePreference } from '../../states/color-mode-adapter'

import type { ThemePreference } from '../../states/theme'

defineOptions({ name: 'CxThemeToggle' })

const { preference, cycle, label } = useThemeCycle(useColorModePreference())

const THEME_ICONS: Record<ThemePreference, string> = {
  light: 'i-lucide-sun',
  dark: 'i-lucide-moon',
  system: 'i-lucide-monitor',
}

const iconName = computed(() => THEME_ICONS[preference.value] ?? THEME_ICONS.system)
const ariaLabel = computed(() => `主题：${label.value}，点击切换`)
</script>
