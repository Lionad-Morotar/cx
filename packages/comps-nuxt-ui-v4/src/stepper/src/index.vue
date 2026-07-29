<!-- CxNuxtUIV4Stepper: 包装 Nuxt UI v4 UStepper，透传步骤 items 与颜色/方向 -->
<template>
  <UStepper :items="props.items" :color="props.color" :orientation="props.orientation" />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { UStepper } from '#components'

defineOptions({ name: 'CxNuxtUIV4Stepper' })

const props = useAttrs() as {
  items?: unknown[]
  color?: string
  orientation?: 'horizontal' | 'vertical'
}
</script>
