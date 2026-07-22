<!-- CxNuxtUIV4Theme: 包装 Nuxt UI v4 UTheme（headless），透传 default slot -->
<template>
  <UTheme><slot /></UTheme>
</template>

<script setup lang="ts">
import { UTheme } from '#components'

defineOptions({ name: 'CxNuxtUIV4Theme' })
</script>
