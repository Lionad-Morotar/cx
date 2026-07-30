<!-- CxNaiveUiCheckboxGroup: 包装 naive-ui NCheckboxGroup；options JSON 经 v-for 展开为 NCheckbox
     （NCheckbox 有 label prop，直接绑定）。桥接族：组无 onChange 函数 prop，update:value 桥接上行 -->
<template>
  <NCheckboxGroup
    v-bind="groupProps"
    :class="ns.b()"
    data-testid="cx-naive-ui-checkbox-group"
    @update:value="emitChange"
  >
    <NCheckbox v-for="option in options" :key="String(option.value)" :value="option.value" :label="option.label" />
  </NCheckboxGroup>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { NCheckbox, NCheckboxGroup } from 'naive-ui'
import { useCxBEM } from '@lionad/cx-vue'

import { useNaiveUiProps } from '../../shared/use-naive-ui-props'
import { useNaiveChangeBridge } from '../../shared/use-naive-change-bridge'

defineOptions({ name: 'CxNaiveUiCheckboxGroup', inheritAttrs: false })

/** 低代码侧配置的选项形态 */
interface CheckboxOption {
  label: string
  value: string | number
}

const ns = useCxBEM('naive-ui-checkbox-group')
const naiveProps = useNaiveUiProps(useAttrs())
const { forwarded, emitChange } = useNaiveChangeBridge(naiveProps)
const options = computed<CheckboxOption[]>(() => {
  const raw = naiveProps.value.options
  return Array.isArray(raw) ? (raw as CheckboxOption[]) : []
})
const groupProps = computed(() => {
  const { options: _options, ...rest } = forwarded.value
  return rest
})
</script>
