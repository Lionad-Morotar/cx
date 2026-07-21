<!-- CxNuxtUIV4Pagination: 包装 Nuxt UI v4 UPagination，透传核心 props 与 slots。 -->
<template>
  <UPagination
    :total="props.total"
    :page="props.page"
    :items-per-page="props.itemsPerPage"
    :sibling-count="props.siblingCount"
    :show-edges="props.showEdges"
  >
    <template #prev><slot name="prev" /></template>
    <template #next><slot name="next" /></template>
    <template #item><slot name="item" /></template>
    <template #first><slot name="first" /></template>
    <template #last><slot name="last" /></template>
  </UPagination>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { UPagination } from '#components'

defineOptions({ name: 'CxNuxtUIV4Pagination' })

const props = useAttrs() as {
  total?: number
  page?: number
  itemsPerPage?: number
  siblingCount?: number
  showEdges?: boolean
}
</script>
