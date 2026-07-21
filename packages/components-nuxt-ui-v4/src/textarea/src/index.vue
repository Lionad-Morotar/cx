<!-- CxNuxtUIV4Textarea: 包装 Nuxt UI v4 UTextarea，透传核心 props 与 default slot -->
<template>
  <UTextarea
    :placeholder="props.placeholder"
    :rows="props.rows"
    :autoresize="props.autoresize"
    :disabled="props.disabled"
    :size="props.size"
    :variant="props.variant"
    :color="props.color"
  >
    <template #default><slot /></template>
  </UTextarea>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { UTextarea } from '#components'

defineOptions({ name: 'CxNuxtUIV4Textarea' })

const props = useAttrs() as {
  placeholder?: string
  rows?: number
  autoresize?: boolean
  disabled?: boolean
  size?: string
  variant?: string
  color?: string
}
</script>
