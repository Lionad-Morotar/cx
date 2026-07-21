<!-- CxNuxtUIV4Popover: 包装 Nuxt UI v4 UPopover。
  v4 无顶级 placement，方位通过 content.side 传入；物料层做此映射。 -->
<template>
  <UPopover :open="props.open" :mode="props.mode" :content="{ side: props.placement }">
    <template #default><slot name="default" /></template>
    <template #content><slot name="content" /></template>
    <template #anchor><slot name="anchor" /></template>
  </UPopover>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { UPopover } from '#components'

defineOptions({ name: 'CxNuxtUIV4Popover' })

const props = useAttrs() as {
  open?: boolean
  mode?: 'click' | 'hover'
  placement?: string
}
</script>
