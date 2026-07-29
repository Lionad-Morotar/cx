<!-- CxElementPlusButton: 包装 EP ElButton；label 经 default slot 注入（EP 无 label prop，避开 text 布尔 prop 语义冲突） -->
<template>
  <ElButton v-bind="buttonProps" :class="ns.b()" data-testid="cx-element-plus-button">
    {{ label }}
  </ElButton>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { ElButton } from 'element-plus'
import { useCxBEM } from '@lionad/cx-vue'

import { useEpProps } from '../../shared/use-ep-props'

defineOptions({ name: 'CxElementPlusButton', inheritAttrs: false })

const ns = useCxBEM('element-plus-button')
const epProps = useEpProps(useAttrs())
const label = computed(() => (epProps.value.label as string | undefined) ?? '')
// label 是物料自有配置键（EP ElButton 无此 prop，其 text 为布尔型「文字按钮」开关），
// 透传前剥离以免被 EP 当作未知 attr 落到根 DOM
const buttonProps = computed(() => {
  const { label: _label, ...rest } = epProps.value
  return rest
})
</script>
