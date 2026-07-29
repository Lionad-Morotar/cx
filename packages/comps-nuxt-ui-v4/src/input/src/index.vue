<!-- CxNuxtUIV4Input: 包装 Nuxt UI v4 UInput，透传核心 props 与 slots -->
<template>
  <UInput
    :placeholder="props.placeholder"
    :type="props.type"
    :size="props.size"
    :color="props.color"
    :variant="props.variant"
    :disabled="props.disabled"
    :icon="props.icon"
  >
    <template #leading><slot name="leading" /></template>
    <template #trailing><slot name="trailing" /></template>
  </UInput>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { UInput } from '#components'

defineOptions({ name: 'CxNuxtUIV4Input' })

const props = useAttrs() as {
  placeholder?: string
  type?: string
  size?: string
  color?: string
  variant?: string
  disabled?: boolean
  icon?: string
}
</script>
