<!-- CxNuxtUIV4Checkbox: 包装 Nuxt UI v4 UCheckbox，透传核心 props 与 label slot -->
<template>
  <UCheckbox :label="props.label" :color="props.color" :disabled="props.disabled">
    <template #label><slot name="label" /></template>
  </UCheckbox>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { UCheckbox } from '#components'

defineOptions({ name: 'CxNuxtUIV4Checkbox' })

const props = useAttrs() as {
  label?: string
  color?: string
  disabled?: boolean
}
</script>
