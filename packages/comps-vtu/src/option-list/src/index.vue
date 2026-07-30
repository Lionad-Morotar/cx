<template>
  <!--
    vtu OptionList 的 action/change 是函数型 prop(非 Vue emit),仅 update:modelValue 是真 emit。
    故 action/change 用 :on-* 绑定 prop 回调再 re-emit,modelValue 用 @update 监听,
    统一上抛为包装组件的 emits,供 cx 渲染器经 _cx_events 接线(host 侧 hooks 拦截)。
  -->
  <OptionList
    v-bind="vtuProps"
    :class="ns.b()"
    :on-action="(id, value) => emit('action', id, value)"
    :on-change="(value) => emit('change', value)"
    @update:model-value="(value) => emit('update:modelValue', value)"
  />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
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
</script>
