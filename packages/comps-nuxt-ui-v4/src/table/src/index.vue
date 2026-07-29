<!-- CxNuxtUIV4Table: 包装 Nuxt UI v4 UTable。
  动态列 slot 形如 `${columnId}-cell` / `${columnId}-header`，随列定义变化；
  物料层只展开通用的 #caption 与 #empty，动态列 slot 请在业务侧按列 id 填充。 -->
<template>
  <UTable :data="props.data" :columns="props.columns">
    <template #caption><slot name="caption" /></template>
    <template #empty><slot name="empty" /></template>
  </UTable>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { UTable } from '#components'

defineOptions({ name: 'CxNuxtUIV4Table' })

const props = useAttrs() as {
  data?: any[]
  columns?: any[]
}
</script>
