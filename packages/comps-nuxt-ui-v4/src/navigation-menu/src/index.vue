<!-- CxNuxtUIV4NavigationMenu: 包装 Nuxt UI v4 UNavigationMenu，透传核心 props 与 slots。 -->
<template>
  <UNavigationMenu :items="props.items" :orientation="props.orientation" :color="props.color">
    <template #item><slot name="item" /></template>
    <template #item-leading><slot name="item-leading" /></template>
    <template #item-trailing><slot name="item-trailing" /></template>
  </UNavigationMenu>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { UNavigationMenu } from '#components'

defineOptions({ name: 'CxNuxtUIV4NavigationMenu' })

const props = useAttrs() as {
  items?: any[]
  orientation?: 'horizontal' | 'vertical'
  color?: string
}
</script>
