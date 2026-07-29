<!-- CxNuxtUIV4InputMenu: 包装 Nuxt UI v4 UInputMenu，透传核心 props 与 v4 slot 名（item/item-leading） -->
<template>
  <UInputMenu
    :placeholder="props.placeholder"
    :items="props.items"
    :value-key="props.valueKey"
    :size="props.size"
    :color="props.color"
  >
    <template #leading><slot name="leading" /></template>
    <template #trailing><slot name="trailing" /></template>
    <template #item="slotProps"><slot name="item" v-bind="slotProps" /></template>
    <template #item-leading="slotProps"><slot name="item-leading" v-bind="slotProps" /></template>
  </UInputMenu>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { UInputMenu } from '#components'

defineOptions({ name: 'CxNuxtUIV4InputMenu' })

const props = useAttrs() as {
  placeholder?: string
  items?: Array<{ label?: string; value?: any } | string>
  valueKey?: string
  size?: string
  color?: string
}
</script>
