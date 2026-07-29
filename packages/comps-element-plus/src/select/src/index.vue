<!-- CxElementPlusSelect: 包装 EP ElSelect；options JSON 经 v-for 展开为 ElOption -->
<template>
  <ElSelect v-bind="restProps" :class="ns.b()" data-testid="cx-element-plus-select">
    <ElOption
      v-for="option in options"
      :key="option.value"
      :label="option.label"
      :value="option.value"
    />
  </ElSelect>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { ElOption, ElSelect } from 'element-plus'
import { useCxBEM } from '@lionad/cx-vue'

import { useEpProps } from '../../shared/use-ep-props'

defineOptions({ name: 'CxElementPlusSelect', inheritAttrs: false })

interface SelectOption {
  label: string
  value: string
}

const ns = useCxBEM('element-plus-select')
const epProps = useEpProps(useAttrs())
const options = computed<SelectOption[]>(() => {
  const raw = epProps.value.options
  return Array.isArray(raw) ? (raw as SelectOption[]) : []
})
// options 是物料自有配置键（EP 无此 prop），透传前剥离
const restProps = computed(() => {
  const { options: _options, ...rest } = epProps.value
  return rest
})
</script>
