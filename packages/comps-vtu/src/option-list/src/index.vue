<template>
  <!--
    vtu OptionList 的 action/change 是函数型 prop(非 Vue emit),仅 update:modelValue 是真 emit。
    故 action/change 用 :on-* 绑定 prop 回调再 re-emit,modelValue 用 @update 监听,
    统一上抛为包装组件的 emits,供 cx 渲染器经 _cx_events 接线(host 侧 hooks 拦截)。
  -->
  <OptionList
    v-bind="vtuProps"
    :class="ns.b()"
    :actions="normalizedActions"
    :on-action="(id, value) => emit('action', id, value)"
    :on-change="(value) => emit('change', value)"
    @update:model-value="(value) => emit('update:modelValue', value)"
  />
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { OptionList } from '@lionad/vtu-components'
import { useCxBEM } from '@lionad/cx-vue'

import { useVtuProps } from '../../shared/use-vtu-props'

import type { OptionListProps, OptionListSelection } from '@lionad/vtu-components'

defineOptions({ name: 'CxVtuOptionList', inheritAttrs: false })

// 与 meta emits 同集合:declare 后这些 on* 从 $attrs 消费,避免 useVtuProps 二次透传造成重复绑定
const emit = defineEmits<{
  action: [actionId: string, value: OptionListSelection]
  change: [value: OptionListSelection]
  'update:modelValue': [value: OptionListSelection]
}>()

const ns = useCxBEM('vtu-option-list')
const vtuProps = useVtuProps<OptionListProps>(useAttrs(), 'cx-vtu-option-list')

// vtu 在未传 actions 时内置默认 [Clear, Confirm]——LLM 对话契约里负面按钮无语义
// (用户不回应即取消),且默认 Confirm 会经 action 直发一条用户看不懂的回写;
// 故未配置时压为空数组,配置了才透传
const normalizedActions = computed(() => vtuProps.value.actions ?? [])
</script>
