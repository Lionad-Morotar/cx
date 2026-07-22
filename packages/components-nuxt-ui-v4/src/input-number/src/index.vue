<!-- CxNuxtUIV4InputNumber: 包装 Nuxt UI v4 UInputNumber，物料层 value 单向映射 default-value -->
<template>
  <UInputNumber
    :default-value="props.value"
    :min="props.min"
    :max="props.max"
    :step="props.step"
    :placeholder="props.placeholder || undefined"
    :orientation="props.orientation"
    :disabled="props.disabled"
  />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { UInputNumber } from '#components'

defineOptions({ name: 'CxNuxtUIV4InputNumber' })

const props = useAttrs() as {
  value?: number
  min?: number
  max?: number
  step?: number
  placeholder?: string
  orientation?: 'horizontal' | 'vertical'
  disabled?: boolean
}
</script>
