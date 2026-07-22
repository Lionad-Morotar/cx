<!-- CxNuxtUIV4App: 包装 Nuxt UI v4 UApp，透传全局配置 props 与 default slot -->
<template>
  <UApp :dir="props.dir" :scroll-body="props.scrollBody">
    <slot />
  </UApp>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { UApp } from '#components'

defineOptions({ name: 'CxNuxtUIV4App' })

const props = useAttrs() as {
  dir?: 'ltr' | 'rtl'
  scrollBody?: boolean
}
</script>
