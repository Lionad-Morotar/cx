<template>
  <span style="display: none" aria-hidden="true" />
</template>

<script setup lang="ts">
import type { CxComponentRuntime } from '@lionad/cx-definition'
import { watch } from 'vue'

defineOptions({ name: 'CxState' })

const props = defineProps<{
  cmpt: CxComponentRuntime
  name?: string
  value?: any
}>()

/**
 * 状态桥物料：把宿主 view 层传入的响应式 value 同步到自身 cmpt.data.value，
 * 供 schema 内其他物料经 _cx_data_config 按同名 key 绑定。
 *
 * 解决「外部状态（如 store/ref）无法被 _cx_data_config 直接绑定」的缺口
 * （_cx_data_config 只能在 schema 内组件间 mirror）。cx-state 是外部状态
 * 进入 schema 的入口，与 cx-action 的 loading/data/error 暴露机制同构，
 * 也修补了 cx-datas 用硬编码 provide key 的命名冲突隐患。
 */
watch(
  () => props.value,
  (v) => {
    props.cmpt.data.value = v
  },
  { immediate: true },
)
</script>
