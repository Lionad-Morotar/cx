<!-- CxNuxtUIV4Slideover: 包装 Nuxt UI v4 USlideover，透传核心 props 与 slots。 -->
<template>
  <USlideover :title="props.title" :open="props.open" :side="props.side">
    <template #default><slot name="default" /></template>
    <template #header><slot name="header" /></template>
    <template #body><slot name="body" /></template>
    <template #footer><slot name="footer" /></template>
    <template #title><slot name="title" /></template>
    <template #description><slot name="description" /></template>
  </USlideover>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { USlideover } from '#components'

defineOptions({ name: 'CxNuxtUIV4Slideover' })

const props = useAttrs() as {
  title?: string
  open?: boolean
  side?: 'right' | 'left'
}
</script>
