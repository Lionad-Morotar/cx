<!-- CxNuxtUIV4Carousel: 包装 Nuxt UI v4 UCarousel；cx 层 item slot 经 v4 default slot 透传（per-item scope） -->
<template>
  <UCarousel :items="props.items" :loop="props.loop" :arrows="props.arrows" :dots="props.dots">
    <template #default="scope"><slot name="item" v-bind="scope" /></template>
  </UCarousel>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { UCarousel } from '#components'

defineOptions({ name: 'CxNuxtUIV4Carousel' })

const props = useAttrs() as {
  items?: any[]
  loop?: boolean
  arrows?: boolean
  dots?: boolean
}
</script>
