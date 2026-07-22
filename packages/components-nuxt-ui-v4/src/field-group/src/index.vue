<!-- CxNuxtUIV4FieldGroup: 包装 Nuxt UI v4 UFieldGroup，透传 orientation/size 与 default slot -->
<template>
  <UFieldGroup :orientation="props.orientation" :size="props.size">
    <slot />
  </UFieldGroup>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { UFieldGroup } from '#components'

defineOptions({ name: 'CxNuxtUIV4FieldGroup' })

const props = useAttrs() as {
  orientation?: 'horizontal' | 'vertical'
  size?: string
}
</script>
