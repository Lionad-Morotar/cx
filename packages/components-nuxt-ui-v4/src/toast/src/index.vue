<!-- CxNuxtUIV4Toast: 包装 Nuxt UI v4 UToast（单条通知）。
  v4 prop 名为 duration（非 timeout），以 v4 源码为准。 -->
<template>
  <UToast
    :title="props.title"
    :description="props.description"
    :color="props.color"
    :icon="props.icon"
    :duration="props.duration"
  >
    <template #title><slot name="title" /></template>
    <template #description><slot name="description" /></template>
    <template #leading><slot name="leading" /></template>
    <template #actions><slot name="actions" /></template>
  </UToast>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { UToast } from '#components'

defineOptions({ name: 'CxNuxtUIV4Toast' })

const props = useAttrs() as {
  title?: string
  description?: string
  color?: string
  icon?: string
  duration?: number
}
</script>
