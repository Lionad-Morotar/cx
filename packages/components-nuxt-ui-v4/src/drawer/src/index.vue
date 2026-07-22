<!-- CxNuxtUIV4Drawer: 包装 Nuxt UI v4 UDrawer，透传标题/方向/关闭等与五个区域 slot -->
<template>
  <UDrawer
    :title="props.title"
    :description="props.description || undefined"
    :direction="props.direction"
    :close="props.close"
    :inset="props.inset"
    :handle="props.handle"
  >
    <slot />
    <template #content><slot name="content" /></template>
    <template #header><slot name="header" /></template>
    <template #body><slot name="body" /></template>
    <template #footer><slot name="footer" /></template>
  </UDrawer>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { UDrawer } from '#components'

defineOptions({ name: 'CxNuxtUIV4Drawer' })

const props = useAttrs() as {
  title?: string
  description?: string
  direction?: 'bottom' | 'right' | 'left' | 'top'
  close?: boolean
  inset?: boolean
  handle?: boolean
}
</script>
