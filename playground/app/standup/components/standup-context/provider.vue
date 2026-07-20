<template>
  <slot />
</template>

<script lang="ts" setup>
import { provide } from 'vue'

import { StandupGroupKey, StandupItemKey } from './keys'

import type { StandupItemContext } from './keys'
import type { GroupOfStandup } from '../../apis'

/**
 * 循环容器在 v-for 的每次迭代里用本组件包裹模板插槽，
 * 把当前 group / standup 注入上下文，供插槽内的 schema 子节点 inject。
 * provide 在 setup 中执行一次；每次迭代会创建独立的 Provider 实例，互不干扰。
 */
const props = defineProps<{
  group?: GroupOfStandup
  item?: StandupItemContext
}>()

if (props.group) {
  provide(StandupGroupKey, props.group)
}
if (props.item) {
  provide(StandupItemKey, props.item)
}
</script>
