<!-- CxNuxtUIV4Switch: 包装 Nuxt UI v4 USwitch，透传核心 props 与 label slot -->
<template>
  <USwitch :label="props.label" :color="props.color" :disabled="props.disabled">
    <template #label><slot name="label" /></template>
  </USwitch>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { USwitch } from '#components'

defineOptions({ name: 'CxNuxtUIV4Switch' })

const props = useAttrs() as {
  label?: string
  color?: string
  disabled?: boolean
}
</script>
