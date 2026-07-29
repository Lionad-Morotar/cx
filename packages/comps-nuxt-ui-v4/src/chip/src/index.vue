<!-- CxNuxtUIV4Chip: 包装 Nuxt UI v4 UChip；v4 Chip 无 variant，透传 text/color/size/position -->
<template>
  <UChip :text="props.text" :color="props.color" :size="props.size" :position="props.position">
    <template #default><slot /></template>
    <template #content><slot name="content" /></template>
  </UChip>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { UChip } from '#components'

defineOptions({ name: 'CxNuxtUIV4Chip' })

const props = useAttrs() as {
  text?: string
  color?: string
  size?: string
  position?: string
}
</script>
