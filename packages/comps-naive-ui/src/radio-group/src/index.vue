<!-- CxNaiveUiRadioGroup: 包装 naive-ui NRadioGroup；options JSON 经 v-for 展开为 NRadio
     （NRadio 无 label prop，文本经 default slot 注入）。桥接族：组无 onChange 函数 prop，
     v-bind 载荷剥离 options/onChange/onInput，update:value 桥接至 attrs.onChange -->
<template>
  <NRadioGroup v-bind="groupProps" :class="ns.b()" data-testid="cx-naive-ui-radio-group" @update:value="emitChange">
    <NRadio v-for="option in options" :key="String(option.value)" :value="option.value">
      {{ option.label }}
    </NRadio>
  </NRadioGroup>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { NRadio, NRadioGroup } from 'naive-ui'
import { useCxBEM } from '@lionad/cx-vue'

import { useNaiveUiProps } from '../../shared/use-naive-ui-props'
import { useNaiveChangeBridge } from '../../shared/use-naive-change-bridge'

defineOptions({ name: 'CxNaiveUiRadioGroup', inheritAttrs: false })

/** 低代码侧配置的选项形态 */
interface RadioOption {
  label: string
  value: string | number
}

const ns = useCxBEM('naive-ui-radio-group')
const naiveProps = useNaiveUiProps(useAttrs())
const { forwarded, emitChange } = useNaiveChangeBridge(naiveProps)
const options = computed<RadioOption[]>(() => {
  const raw = naiveProps.value.options
  return Array.isArray(raw) ? (raw as RadioOption[]) : []
})
// options 是物料自有配置键（NRadioGroup 无此 prop），连同 onChange/onInput 一并剥离
const groupProps = computed(() => {
  const { options: _options, ...rest } = forwarded.value
  return rest
})
</script>
