<!-- CxNuxtUIV4Container: 包装 Nuxt UI v4 UContainer 居中容器 -->
<template>
  <UContainer>
    <slot />
  </UContainer>
</template>

<script setup lang="ts">
import { UContainer } from '#components'

defineOptions({ name: 'CxNuxtUIV4Container' })
</script>
