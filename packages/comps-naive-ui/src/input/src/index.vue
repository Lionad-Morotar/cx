<!-- CxNaiveUiInput: 包装 naive-ui NInput；value 经 attrs 原样透传（naive 双向约定 value + update:value）。
     NInput 把 onInput/onChange 声明为函数型 props（naive 约定回调即 prop，非 Vue emits）并于内部
     调用（逐键 input、提交态 change），v-bind 的监听器直达为这些 props，包装层无需桥接 -->
<template>
  <NInput v-bind="naiveProps" :class="ns.b()" data-testid="cx-naive-ui-input" />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { NInput } from 'naive-ui'
import { useCxBEM } from '@lionad/cx-vue'

import { useNaiveUiProps } from '../../shared/use-naive-ui-props'

defineOptions({ name: 'CxNaiveUiInput', inheritAttrs: false })

const ns = useCxBEM('naive-ui-input')
const naiveProps = useNaiveUiProps(useAttrs())
</script>
