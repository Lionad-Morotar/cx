<!-- CxNuxtUIV4InputRating: 包装 Nuxt UI v4 UInputRating，物料层 value 单向映射 default-value -->
<template>
  <UInputRating
    :default-value="props.value"
    :length="props.length"
    :step="props.step"
    :clearable="props.clearable"
    :hoverable="props.hoverable"
    :icon="props.icon"
    :color="props.color"
    :disabled="props.disabled"
  />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { UInputRating } from '#components'

defineOptions({ name: 'CxNuxtUIV4InputRating' })

const props = useAttrs() as {
  value?: number
  length?: number
  step?: number
  clearable?: boolean
  hoverable?: boolean
  icon?: string
  color?: string
  disabled?: boolean
}
</script>
