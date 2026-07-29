<!-- CxNuxtUIV4Alert: 包装 Nuxt UI v4 UAlert；v4 无 default/trailing slot，透传 leading/title/description/actions -->
<template>
  <UAlert
    :title="props.title"
    :description="props.description"
    :icon="props.icon"
    :color="props.color"
    :variant="props.variant"
  >
    <template #leading><slot name="leading" /></template>
    <template #title><slot name="title" /></template>
    <template #description><slot name="description" /></template>
    <template #actions><slot name="actions" /></template>
  </UAlert>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { UAlert } from '#components'

defineOptions({ name: 'CxNuxtUIV4Alert' })

const props = useAttrs() as {
  title?: string
  description?: string
  icon?: string
  color?: string
  variant?: string
}
</script>
