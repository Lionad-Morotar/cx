<template>
  <!--
    vtu ParameterSlider 的 change/action 是函数型 prop(非 Vue emit),
    包装件 :on-* 绑定回调再 re-emit,统一上抛供 cx 渲染器经 _cx_events 接线(host 侧 hooks 拦截)。
  -->
  <ParameterSlider
    v-bind="vtuProps"
    :class="ns.b()"
    :on-change="(values: SliderValue[]) => emit('change', values)"
    :on-action="(actionId: string, values: SliderValue[]) => emit('action', actionId, values)"
  />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { ParameterSlider } from '@lionad/vtu-components'
import { useCxBEM } from '@lionad/cx-vue'

import { useVtuProps } from '../../shared/use-vtu-props'

import type { ParameterSliderProps, SliderValue } from '@lionad/vtu-components'

defineOptions({ name: 'CxVtuParameterSlider', inheritAttrs: false })

// 与 meta emits 同集合:declare 后这些 on* 从 $attrs 消费,避免 useVtuProps 二次透传造成重复绑定
const emit = defineEmits<{
  change: [values: SliderValue[]]
  action: [actionId: string, values: SliderValue[]]
}>()

const ns = useCxBEM('vtu-parameter-slider')
const vtuProps = useVtuProps<ParameterSliderProps>(useAttrs(), 'cx-vtu-parameter-slider')
</script>
