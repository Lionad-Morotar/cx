<!-- CxNaiveUiSelect: 包装 naive-ui NSelect。透传族：NSelect 声明并调用 onChange 函数 prop
     （Select.mjs call(onChange, value, option)），v-bind 直达即接入 cx 事件链；
     options 为非数组时兜底空数组，避免低代码侧脏配置触发 naive 内部报错 -->
<template>
  <NSelect v-bind="selectProps" :class="ns.b()" data-testid="cx-naive-ui-select" />
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { NSelect } from 'naive-ui'
import { useCxBEM } from '@lionad/cx-vue'

import { useNaiveUiProps } from '../../shared/use-naive-ui-props'

defineOptions({ name: 'CxNaiveUiSelect', inheritAttrs: false })

const ns = useCxBEM('naive-ui-select')
const naiveProps = useNaiveUiProps(useAttrs())
const selectProps = computed(() => {
  const rest: Record<string, unknown> = { ...naiveProps.value }
  if (!Array.isArray(rest.options)) {
    rest.options = []
  }
  return rest
})
</script>
