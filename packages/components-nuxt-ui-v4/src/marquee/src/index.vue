<!-- CxNuxtUIV4Marquee: 包装 Nuxt UI v4 UMarquee，透传滚动配置与 default slot -->
<template>
  <UMarquee
    :pause-on-hover="props.pauseOnHover"
    :reverse="props.reverse"
    :orientation="props.orientation"
    :repeat="props.repeat"
  >
    <slot />
  </UMarquee>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { UMarquee } from '#components'

defineOptions({ name: 'CxNuxtUIV4Marquee' })

const props = useAttrs() as {
  pauseOnHover?: boolean
  reverse?: boolean
  orientation?: 'horizontal' | 'vertical'
  repeat?: number
}
</script>
