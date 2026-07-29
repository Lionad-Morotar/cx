<!-- CxNuxtUIV4AvatarGroup: 包装 Nuxt UI v4 UAvatarGroup，透传 max/size/color 与 default slot -->
<template>
  <UAvatarGroup :max="props.max" :size="props.size" :color="props.color">
    <slot />
  </UAvatarGroup>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { UAvatarGroup } from '#components'

defineOptions({ name: 'CxNuxtUIV4AvatarGroup' })

const props = useAttrs() as {
  max?: number
  size?: string
  color?: string
}
</script>
