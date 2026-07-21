<!-- CxNuxtUIV4ContextMenu: 包装 Nuxt UI v4 UContextMenu。右键触发区域弹出菜单。 -->
<template>
  <UContextMenu :items="props.items">
    <template #default><slot name="default" /></template>
  </UContextMenu>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { UContextMenu } from '#components'

defineOptions({ name: 'CxNuxtUIV4ContextMenu' })

const props = useAttrs() as {
  items?: any[]
}
</script>
