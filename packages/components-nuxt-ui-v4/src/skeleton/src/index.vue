<!-- CxNuxtUIV4Skeleton: 包装 Nuxt UI v4 USkeleton；v4 无尺寸 prop，由 style 注入 width/height；无 slot -->
<template>
  <USkeleton :style="style" />
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { USkeleton } from '#components'

defineOptions({ name: 'CxNuxtUIV4Skeleton' })

const props = useAttrs() as {
  width?: string
  height?: string
}

const style = computed(() => ({
  width: props.width,
  height: props.height,
}))
</script>
