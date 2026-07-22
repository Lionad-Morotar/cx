<!-- CxNuxtUIV4ScrollArea: 包装 Nuxt UI v4 UScrollArea，透传方向/虚拟化与 default slot -->
<template>
  <UScrollArea :orientation="props.orientation" :virtualize="props.virtualize || undefined">
    <slot />
  </UScrollArea>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { UScrollArea } from '#components'

defineOptions({ name: 'CxNuxtUIV4ScrollArea' })

const props = useAttrs() as {
  orientation?: 'vertical' | 'horizontal'
  virtualize?: boolean
}
</script>
