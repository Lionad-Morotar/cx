<!-- CxNuxtUIV4InputTime: 包装 Nuxt UI v4 UInputTime，透传展示配置 props -->
<template>
  <UInputTime
    :range="props.range"
    :hour-cycle="props.hourCycle"
    :icon="props.icon"
    :color="props.color"
    :disabled="props.disabled"
  />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { UInputTime } from '#components'

defineOptions({ name: 'CxNuxtUIV4InputTime' })

const props = useAttrs() as {
  range?: boolean
  hourCycle?: 12 | 24
  icon?: string
  color?: string
  disabled?: boolean
}
</script>
