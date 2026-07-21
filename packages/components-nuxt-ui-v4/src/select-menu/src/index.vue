<!-- CxNuxtUIV4SelectMenu: 包装 Nuxt UI v4 USelectMenu，透传核心 props 与 v4 slot 名（default/item） -->
<template>
  <USelectMenu
    :placeholder="props.placeholder"
    :items="props.items"
    :value-key="props.valueKey"
    :multiple="props.multiple"
    :size="props.size"
    :color="props.color"
  >
    <template #leading><slot name="leading" /></template>
    <template #default="slotProps"><slot v-bind="slotProps" /></template>
    <template #trailing><slot name="trailing" /></template>
    <template #item="slotProps"><slot name="item" v-bind="slotProps" /></template>
  </USelectMenu>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { USelectMenu } from '#components'

defineOptions({ name: 'CxNuxtUIV4SelectMenu' })

const props = useAttrs() as {
  placeholder?: string
  items?: Array<{ label?: string; value?: any } | string>
  valueKey?: string
  multiple?: boolean
  size?: string
  color?: string
}
</script>
