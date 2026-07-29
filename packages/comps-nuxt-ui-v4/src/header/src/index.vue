<!-- CxNuxtUIV4Header: 包装 Nuxt UI v4 UHeader，透传标题/链接/菜单模式与六个区域 slot -->
<template>
  <UHeader :title="props.title" :to="props.to" :mode="props.mode">
    <template #title><slot name="title" /></template>
    <template #left><slot name="left" /></template>
    <template #default><slot /></template>
    <template #right><slot name="right" /></template>
    <template #body><slot name="body" /></template>
    <template #content><slot name="content" /></template>
  </UHeader>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { UHeader } from '#components'

defineOptions({ name: 'CxNuxtUIV4Header' })

const props = useAttrs() as {
  title?: string
  to?: string
  mode?: 'modal' | 'slideover' | 'drawer'
}
</script>
