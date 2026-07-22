<!-- CxNuxtUIV4Timeline: 包装 Nuxt UI v4 UTimeline，透传事件 items 与颜色 -->
<template>
  <UTimeline :items="props.items" :color="props.color" />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { UTimeline } from '#components'

defineOptions({ name: 'CxNuxtUIV4Timeline' })

const props = useAttrs() as {
  items?: unknown[]
  color?: string
}
</script>
