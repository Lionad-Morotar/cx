<!-- CxNuxtUIV4Avatar: 包装 Nuxt UI v4 UAvatar，透传 src/alt/text/size -->
<template>
  <UAvatar :src="props.src" :alt="props.alt" :text="props.text" :size="props.size">
    <template #default><slot /></template>
  </UAvatar>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { UAvatar } from '#components'

defineOptions({ name: 'CxNuxtUIV4Avatar' })

const props = useAttrs() as {
  src?: string
  alt?: string
  text?: string
  size?: string
}
</script>
