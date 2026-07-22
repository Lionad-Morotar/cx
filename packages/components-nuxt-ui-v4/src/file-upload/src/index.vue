<!-- CxNuxtUIV4FileUpload: 包装 Nuxt UI v4 UFileUpload，透传标签/类型/形态等 props -->
<template>
  <UFileUpload
    :label="props.label"
    :description="props.description"
    :icon="props.icon"
    :accept="props.accept"
    :multiple="props.multiple"
    :variant="props.variant"
    :color="props.color"
  >
    <template #actions><slot name="actions" /></template>
  </UFileUpload>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { UFileUpload } from '#components'

defineOptions({ name: 'CxNuxtUIV4FileUpload' })

const props = useAttrs() as {
  label?: string
  description?: string
  icon?: string
  accept?: string
  multiple?: boolean
  variant?: 'area' | 'button'
  color?: string
}
</script>
