<!-- CxNuxtUIV4Progress: 包装 Nuxt UI v4 UProgress；cx 层 value 映射至 v4 的 modelValue（v-model） -->
<template>
  <UProgress
    :model-value="props.value"
    :max="props.max"
    :size="props.size"
    :color="props.color"
  >
    <template #status="{ percent }"><slot name="status" :percent="percent" /></template>
  </UProgress>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { UProgress } from '#components'

defineOptions({ name: 'CxNuxtUIV4Progress' })

const props = useAttrs() as {
  value?: number
  max?: number
  size?: string
  color?: string
}
</script>
