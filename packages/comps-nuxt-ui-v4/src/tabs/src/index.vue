<!-- CxNuxtUIV4Tabs: 包装 Nuxt UI v4 UTabs，透传核心 props 与 slots。 -->
<template>
  <UTabs
    :items="props.items"
    :color="props.color"
    :size="props.size"
    :orientation="props.orientation"
  >
    <template #default><slot name="default" /></template>
    <template #leading><slot name="leading" /></template>
    <template #trailing><slot name="trailing" /></template>
    <template #content><slot name="content" /></template>
  </UTabs>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { UTabs } from '#components'

defineOptions({ name: 'CxNuxtUIV4Tabs' })

const props = useAttrs() as {
  items?: any[]
  color?: string
  size?: string
  orientation?: 'horizontal' | 'vertical'
}
</script>
