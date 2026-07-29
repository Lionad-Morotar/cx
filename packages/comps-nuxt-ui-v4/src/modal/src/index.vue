<!-- CxNuxtUIV4Modal: 包装 Nuxt UI v4 UModal，透传核心 props 与 slots。
  preventOverlay 反向映射为 overlay；closable 映射为 dismissible。 -->
<template>
  <UModal
    :title="props.title"
    :description="props.description"
    :open="props.open"
    :overlay="!props.preventOverlay"
    :dismissible="props.closable"
  >
    <template #default><slot name="default" /></template>
    <template #header><slot name="header" /></template>
    <template #body><slot name="body" /></template>
    <template #footer><slot name="footer" /></template>
    <template #title><slot name="title" /></template>
    <template #description><slot name="description" /></template>
  </UModal>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { UModal } from '#components'

defineOptions({ name: 'CxNuxtUIV4Modal' })

const props = useAttrs() as {
  title?: string
  description?: string
  open?: boolean
  preventOverlay?: boolean
  closable?: boolean
}
</script>
