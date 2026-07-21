<!-- CxNuxtUIV4CommandPalette: 包装 Nuxt UI v4 UCommandPalette，透传核心 props 与 slots。 -->
<template>
  <UCommandPalette :placeholder="props.placeholder" :groups="props.groups">
    <template #empty><slot name="empty" /></template>
    <template #item><slot name="item" /></template>
    <template #item-leading><slot name="item-leading" /></template>
    <template #item-trailing><slot name="item-trailing" /></template>
    <template #group-label><slot name="group-label" /></template>
  </UCommandPalette>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { UCommandPalette } from '#components'

defineOptions({ name: 'CxNuxtUIV4CommandPalette' })

const props = useAttrs() as {
  placeholder?: string
  groups?: any[]
}
</script>
