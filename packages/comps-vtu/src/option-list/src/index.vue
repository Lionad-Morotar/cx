<template>
  <!--
    vtu OptionList 的 action/change/update:modelValue 均为真 emit(0.3.8 起实现只走 emit,
    不再调函数 prop),必须用 @ 监听——:on-* kebab v-bind 会被解析成 props.onAction/onChange,
    而 emit 查找的是 camel 键 onAction/onChange,kebab 绑定永远等不到触发。
    监听后 re-emit 为包装组件 emits,供 cx 渲染器经 _cx_events 接线(host 侧 hooks 拦截)。
  -->
  <OptionList
    v-bind="vtuProps"
    :class="ns.b()"
    :actions="normalizedActions"
    @action="(id, value) => emit('action', id, value, findActionLabel(vtuProps.actions, id))"
    @change="(value) => emit('change', toLabels(value))"
    @update:model-value="(value) => emit('update:modelValue', value)"
  />
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { OptionList } from '@lionad/vtu-components'
import { useCxBEM } from '@lionad/cx-vue'

import { useVtuProps } from '../../shared/use-vtu-props'
import { findActionLabel } from '../../shared/action-label'

import type { OptionListProps, OptionListSelection } from '@lionad/vtu-components'

defineOptions({ name: 'CxVtuOptionList', inheritAttrs: false })

// 与 meta emits 同集合:declare 后这些 on* 从 $attrs 消费,避免 useVtuProps 二次透传造成重复绑定
const emit = defineEmits<{
  action: [actionId: string, value: OptionListSelection, label: string | undefined]
  change: [value: OptionListSelection]
  'update:modelValue': [value: OptionListSelection]
}>()

const ns = useCxBEM('vtu-option-list')
const vtuProps = useVtuProps<OptionListProps>(useAttrs(), 'cx-vtu-option-list')

// vtu 在未传 actions 时内置默认 [Clear, Confirm]——LLM 对话契约里负面按钮无语义
// (用户不回应即取消),且默认 Confirm 会经 action 直发一条用户看不懂的回写;
// 故未配置时压为空数组,配置了才透传
const normalizedActions = computed(() => vtuProps.value.actions ?? [])

/**
 * change 载荷翻译为选项 label(id → label):change 是「通知宿主选了什么」的业务
 * 事件,宿主回写对话要用户可读的 label 而非内部 id;受控数据同步的 id 契约由
 * update:modelValue 原样承载(不翻译)。options 查不到(流式半成品等)退化 id 上抛。
 */
const toLabels = (value: OptionListSelection): OptionListSelection => {
  const options = vtuProps.value.options ?? []
  const labelOf = (id: string) => options.find((o) => o.id === id)?.label ?? id
  if (Array.isArray(value)) return value.map(labelOf)
  return typeof value === 'string' ? labelOf(value) : value
}
</script>
