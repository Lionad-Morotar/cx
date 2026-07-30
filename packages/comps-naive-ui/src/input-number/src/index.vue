<!-- CxNaiveUiInputNumber: 包装 naive-ui NInputNumber。透传族：NInputNumber 声明并调用 onChange
     函数 prop（InputNumber.mjs call(onChange, value)），v-bind 直达即接入 cx 事件链，无需桥接 -->
<template>
  <NInputNumber v-bind="naiveProps" :class="ns.b()" data-testid="cx-naive-ui-input-number" />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { NInputNumber } from 'naive-ui'
import { useCxBEM } from '@lionad/cx-vue'

import { useNaiveUiProps } from '../../shared/use-naive-ui-props'

defineOptions({ name: 'CxNaiveUiInputNumber', inheritAttrs: false })

const ns = useCxBEM('naive-ui-input-number')
const naiveProps = useNaiveUiProps(useAttrs())
</script>
