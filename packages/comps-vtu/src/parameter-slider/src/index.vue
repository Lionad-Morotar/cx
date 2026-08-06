<template>
  <!--
    vtu ParameterSlider 的 change/action 是真 emit(实现只走 emit,不调函数 prop),
    必须用 @ 监听——:on-* kebab v-bind 进不了 emit 的 camel 键查找,事件会丢。
  -->
  <ParameterSlider
    v-bind="vtuProps"
    :class="ns.b()"
    @change="(values: SliderValue[]) => emit('change', values)"
    @action="(actionId: string, values: SliderValue[]) => emit('action', actionId, values)"
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
