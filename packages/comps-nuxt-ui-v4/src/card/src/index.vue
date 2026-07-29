<!-- CxNuxtUIV4Card: 包装 Nuxt UI v4 UCard；v4 无 header-leading/header-trailing slot，透传 header/default/footer -->
<template>
  <UCard :title="props.title" :description="props.description" :variant="props.variant">
    <template #header><slot name="header" /></template>
    <template #default><slot /></template>
    <template #footer><slot name="footer" /></template>
  </UCard>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { UCard } from '#components'

defineOptions({ name: 'CxNuxtUIV4Card' })

const props = useAttrs() as {
  title?: string
  description?: string
  variant?: string
}
</script>
