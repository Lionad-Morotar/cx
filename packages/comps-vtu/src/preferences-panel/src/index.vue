<template>
  <!--
    vtu PreferencesPanel 的 change/action 是真 emit(实现只走 emit,不调函数 prop),
    必须用 @ 监听——:on-* kebab v-bind 进不了 emit 的 camel 键查找,事件会丢。
    vtu 声明的 update:value 不在 re-emit 集合内(整值变更由 change 承载)。
  -->
  <PreferencesPanel
    v-bind="vtuProps"
    :class="ns.b()"
    @change="(value: PreferencesValue) => emit('change', value)"
    @action="(actionId: string, value: PreferencesValue) => emit('action', actionId, value)"
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
