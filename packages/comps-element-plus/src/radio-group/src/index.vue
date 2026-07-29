<!-- CxElementPlusRadioGroup: 包装 EP ElRadioGroup；options JSON 经 v-for 展开为 ElRadio（EP 2.x 以 value 绑定） -->
<template>
  <ElRadioGroup v-bind="restProps" :class="ns.b()" data-testid="cx-element-plus-radio-group">
    <ElRadio v-for="option in options" :key="option.value" :value="option.value">
      {{ option.label }}
    </ElRadio>
  </ElRadioGroup>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { ElRadio, ElRadioGroup } from 'element-plus'
import { useCxBEM } from '@lionad/cx-vue'

import { useEpProps } from '../../shared/use-ep-props'

defineOptions({ name: 'CxElementPlusRadioGroup', inheritAttrs: false })

interface RadioOption {
  label: string
  value: string
}

const ns = useCxBEM('element-plus-radio-group')
const epProps = useEpProps(useAttrs())
const options = computed<RadioOption[]>(() => {
  const raw = epProps.value.options
  return Array.isArray(raw) ? (raw as RadioOption[]) : []
})
// options 是物料自有配置键（EP 无此 prop），透传前剥离
const restProps = computed(() => {
  const { options: _options, ...rest } = epProps.value
  return rest
})
</script>
