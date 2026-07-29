<!-- CxNuxtUIV4Button: 包装 Nuxt UI v4 UButton，透传核心 props 与 slots -->
<template>
  <UButton
    :label="props.label"
    :variant="props.variant"
    :color="props.color"
    :size="props.size"
    :block="props.block"
    :square="props.square"
    :disabled="props.disabled"
    :loading="props.loading"
  >
    <template #leading><slot name="leading" /></template>
    <template #default><slot /></template>
    <template #trailing><slot name="trailing" /></template>
  </UButton>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { UButton } from '#components'

defineOptions({ name: 'CxNuxtUIV4Button' })

const props = useAttrs() as {
  label?: string
  variant?: string
  color?: string
  size?: string
  block?: boolean
  square?: boolean
  disabled?: boolean
  loading?: boolean
}
</script>
