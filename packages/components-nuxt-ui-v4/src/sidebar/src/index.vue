<!-- CxNuxtUIV4Sidebar: 包装 Nuxt UI v4 USidebar，物料层 open 单向映射 v-model:open -->
<template>
  <USidebar
    :open="props.open"
    :collapsible="props.collapsible"
    :rail="props.rail"
    :side="props.side"
  >
    <template #header><slot name="header" /></template>
    <template #default><slot /></template>
    <template #footer><slot name="footer" /></template>
  </USidebar>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { USidebar } from '#components'

defineOptions({ name: 'CxNuxtUIV4Sidebar' })

const props = useAttrs() as {
  open?: boolean
  collapsible?: 'offcanvas' | 'icon' | 'none'
  rail?: boolean
  side?: 'left' | 'right'
}
</script>
