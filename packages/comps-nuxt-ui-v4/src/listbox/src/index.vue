<!-- CxNuxtUIV4Listbox: 包装 Nuxt UI v4 UListbox，透传选项与组态 props -->
<template>
  <UListbox
    :items="props.items"
    :multiple="props.multiple"
    :color="props.color"
    :disabled="props.disabled"
  />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { UListbox } from '#components'

defineOptions({ name: 'CxNuxtUIV4Listbox' })

const props = useAttrs() as {
  items?: unknown[]
  multiple?: boolean
  color?: string
  disabled?: boolean
}
</script>
