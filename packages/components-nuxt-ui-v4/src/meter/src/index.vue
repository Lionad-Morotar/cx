<!-- CxNuxtUIV4Meter: 包装 Nuxt UI v4 UProgress 模拟仪表。
  value 映射为 v4 的 modelValue；v4 Progress 只有 #status slot。 -->
<template>
  <UProgress :model-value="props.value" :max="props.max" :color="props.color">
    <template #status><slot name="status" /></template>
  </UProgress>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { UProgress } from '#components'

defineOptions({ name: 'CxNuxtUIV4Meter' })

const props = useAttrs() as {
  value?: number
  max?: number
  color?: string
}
</script>
