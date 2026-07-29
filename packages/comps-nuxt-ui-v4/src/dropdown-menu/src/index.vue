<!-- CxNuxtUIV4DropdownMenu: 包装 Nuxt UI v4 UDropdownMenu。
  v4 无顶级 placement，方位通过 content.side 传入；物料层做此映射。 -->
<template>
  <UDropdownMenu :items="props.items" :content="{ side: props.placement }">
    <template #default><slot name="default" /></template>
    <template #item-leading><slot name="item-leading" /></template>
    <template #item-trailing><slot name="item-trailing" /></template>
  </UDropdownMenu>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { UDropdownMenu } from '#components'

defineOptions({ name: 'CxNuxtUIV4DropdownMenu' })

const props = useAttrs() as {
  items?: any[]
  placement?: string
}
</script>
