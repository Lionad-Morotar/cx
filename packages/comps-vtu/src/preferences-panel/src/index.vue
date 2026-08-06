<template>
  <!--
    vtu PreferencesPanel 的 change/action 是函数型 prop(非 Vue emit),
    包装件 :on-* 绑定回调再 re-emit,统一上抛供 cx 渲染器经 _cx_events 接线(host 侧 hooks 拦截)。
    vtu 声明的 update:value emit 无对应函数型 prop,不在 re-emit 集合内(整值变更由 change 承载)。
  -->
  <PreferencesPanel
    v-bind="vtuProps"
    :class="ns.b()"
    :on-change="(value: PreferencesValue) => emit('change', value)"
    :on-action="(actionId: string, value: PreferencesValue) => emit('action', actionId, value)"
  />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { PreferencesPanel } from '@lionad/vtu-components'
import { useCxBEM } from '@lionad/cx-vue'

import { useVtuProps } from '../../shared/use-vtu-props'

import type { PreferencesPanelProps, PreferencesValue } from '@lionad/vtu-components'

defineOptions({ name: 'CxVtuPreferencesPanel', inheritAttrs: false })

// 与 meta emits 同集合:declare 后这些 on* 从 $attrs 消费,避免 useVtuProps 二次透传造成重复绑定
const emit = defineEmits<{
  change: [value: PreferencesValue]
  action: [actionId: string, value: PreferencesValue]
}>()

const ns = useCxBEM('vtu-preferences-panel')
const vtuProps = useVtuProps<PreferencesPanelProps>(useAttrs(), 'cx-vtu-preferences-panel')
</script>
