<!-- CxNuxtUIV4Breadcrumb: 包装 Nuxt UI v4 UBreadcrumb，透传核心 props 与 slots。 -->
<template>
  <UBreadcrumb :items="props.items">
    <template #item><slot name="item" /></template>
    <template #item-leading><slot name="item-leading" /></template>
    <template #item-trailing><slot name="item-trailing" /></template>
    <template #separator><slot name="separator" /></template>
  </UBreadcrumb>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { UBreadcrumb } from '#components'

defineOptions({ name: 'CxNuxtUIV4Breadcrumb' })

const props = useAttrs() as {
  items?: any[]
}
</script>
