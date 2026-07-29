<!-- CxNuxtUIV4Footer: 包装 Nuxt UI v4 UFooter，透传五个区域 slot -->
<template>
  <UFooter>
    <template #left><slot name="left" /></template>
    <template #default><slot /></template>
    <template #right><slot name="right" /></template>
    <template #top><slot name="top" /></template>
    <template #bottom><slot name="bottom" /></template>
  </UFooter>
</template>

<script setup lang="ts">
import { UFooter } from '#components'

defineOptions({ name: 'CxNuxtUIV4Footer' })
</script>
