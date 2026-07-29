<!-- CxElementPlusCheckboxGroup: 包装 EP ElCheckboxGroup；options JSON 经 v-for 展开为 ElCheckbox（EP 2.x 以 value 绑定） -->
<template>
  <ElCheckboxGroup v-bind="restProps" :class="ns.b()" data-testid="cx-element-plus-checkbox-group">
    <ElCheckbox v-for="option in options" :key="option.value" :value="option.value">
      {{ option.label }}
    </ElCheckbox>
  </ElCheckboxGroup>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { ElCheckbox, ElCheckboxGroup } from 'element-plus'
import { useCxBEM } from '@lionad/cx-vue'

import { useEpProps } from '../../shared/use-ep-props'

defineOptions({ name: 'CxElementPlusCheckboxGroup', inheritAttrs: false })

interface CheckboxOption {
  label: string
  value: string
}

const ns = useCxBEM('element-plus-checkbox-group')
const epProps = useEpProps(useAttrs())
const options = computed<CheckboxOption[]>(() => {
  const raw = epProps.value.options
  return Array.isArray(raw) ? (raw as CheckboxOption[]) : []
})
// options 是物料自有配置键（EP 无此 prop），透传前剥离
const restProps = computed(() => {
  const { options: _options, ...rest } = epProps.value
  return rest
})
</script>
