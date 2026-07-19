<template>
  <template v-for="column in props.columns">
    <slot :name="column.key" :data="props.data" />
  </template>
</template>

<script lang="ts" setup>
// 列配置映射

import type { Column } from './type'

const props = withDefaults(
  defineProps<{
    columns?: Column[]
    data?: any
  }>(),
  {
    columns: () => [],
    data: () => ({}),
  },
)
</script>
