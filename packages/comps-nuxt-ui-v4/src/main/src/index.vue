<!-- CxNuxtUIV4Main: 包装 Nuxt UI v4 UMain，透传 default slot -->
<template>
  <UMain><slot /></UMain>
</template>

<script setup lang="ts">
import { UMain } from '#components'

defineOptions({ name: 'CxNuxtUIV4Main' })
</script>
