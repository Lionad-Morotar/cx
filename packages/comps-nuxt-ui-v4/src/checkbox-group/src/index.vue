<!-- CxNuxtUIV4CheckboxGroup: 包装 Nuxt UI v4 UCheckboxGroup，透传选项与组态 props -->
<template>
  <UCheckboxGroup
    :items="props.items"
    :legend="props.legend || undefined"
    :color="props.color"
    :variant="props.variant"
    :orientation="props.orientation"
    :disabled="props.disabled"
  />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { UCheckboxGroup } from '#components'

defineOptions({ name: 'CxNuxtUIV4CheckboxGroup' })

const props = useAttrs() as {
  items?: unknown[]
  legend?: string
  color?: string
  variant?: string
  orientation?: 'vertical' | 'horizontal'
  disabled?: boolean
}
</script>
