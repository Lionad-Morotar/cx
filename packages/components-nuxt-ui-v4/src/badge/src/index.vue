<!-- CxNuxtUIV4Badge: 包装 Nuxt UI v4 UBadge，透传核心 props 与 slots -->
<template>
  <UBadge
    :label="props.label"
    :color="props.color"
    :variant="props.variant"
    :size="props.size"
  >
    <template #leading><slot name="leading" /></template>
    <template #default><slot /></template>
    <template #trailing><slot name="trailing" /></template>
  </UBadge>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { UBadge } from '#components'

defineOptions({ name: 'CxNuxtUIV4Badge' })

const props = useAttrs() as {
  label?: string
  color?: string
  variant?: string
  size?: string
}
</script>
