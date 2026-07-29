<!-- CxNuxtUIV4Select: 包装 Nuxt UI v4 USelect，透传 items/valueKey/样式 与 leading/trailing slot -->
<template>
  <USelect
    :placeholder="props.placeholder"
    :items="props.items"
    :value-key="props.valueKey"
    :size="props.size"
    :color="props.color"
    :variant="props.variant"
    :disabled="props.disabled"
  >
    <template #leading><slot name="leading" /></template>
    <template #trailing><slot name="trailing" /></template>
  </USelect>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { USelect } from '#components'

defineOptions({ name: 'CxNuxtUIV4Select' })

const props = useAttrs() as {
  placeholder?: string
  items?: Array<{ label?: string; value?: any } | string>
  valueKey?: string
  size?: string
  color?: string
  variant?: string
  disabled?: boolean
}
</script>
