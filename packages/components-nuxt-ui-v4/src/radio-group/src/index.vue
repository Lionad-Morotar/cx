<!-- CxNuxtUIV4RadioGroup: 包装 Nuxt UI v4 URadioGroup，透传 items/颜色/方向 与 label slot -->
<template>
  <URadioGroup
    :items="props.items"
    :color="props.color"
    :orientation="props.orientation"
    :disabled="props.disabled"
  >
    <template #label><slot name="label" /></template>
  </URadioGroup>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { URadioGroup } from '#components'

defineOptions({ name: 'CxNuxtUIV4RadioGroup' })

const props = useAttrs() as {
  items?: Array<{ label?: string; value?: any } | string>
  color?: string
  orientation?: string
  disabled?: boolean
}
</script>
