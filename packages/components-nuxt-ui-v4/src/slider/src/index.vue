<!-- CxNuxtUIV4Slider: 包装 Nuxt UI v4 USlider，透传区间/步长/颜色，初始值映射到 default-value -->
<template>
  <USlider
    :min="props.min"
    :max="props.max"
    :step="props.step"
    :default-value="props.value"
    :color="props.color"
  />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { USlider } from '#components'

defineOptions({ name: 'CxNuxtUIV4Slider' })

const props = useAttrs() as {
  min?: number
  max?: number
  step?: number
  value?: number
  color?: string
}
</script>
