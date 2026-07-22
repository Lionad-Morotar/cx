<!-- CxNuxtUIV4Banner: 包装 Nuxt UI v4 UBanner，透传标题/图标/颜色/关闭与 slots -->
<template>
  <UBanner :title="props.title" :icon="props.icon" :color="props.color" :close="props.close">
    <template #default><slot /></template>
    <template #actions><slot name="actions" /></template>
  </UBanner>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { UBanner } from '#components'

defineOptions({ name: 'CxNuxtUIV4Banner' })

const props = useAttrs() as {
  title?: string
  icon?: string
  color?: string
  close?: boolean
}
</script>
