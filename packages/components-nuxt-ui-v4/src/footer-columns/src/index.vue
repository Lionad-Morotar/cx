<!-- CxNuxtUIV4FooterColumns: 包装 Nuxt UI v4 UFooterColumns，透传列数据与左右区 slot -->
<template>
  <UFooterColumns :columns="props.columns">
    <template #left><slot name="left" /></template>
    <template #right><slot name="right" /></template>
  </UFooterColumns>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { UFooterColumns } from '#components'

defineOptions({ name: 'CxNuxtUIV4FooterColumns' })

const props = useAttrs() as {
  columns?: unknown[]
}
</script>
