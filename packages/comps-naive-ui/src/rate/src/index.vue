<!-- CxNaiveUiRate: 包装 naive-ui NRate。桥接族：NRate 无 onChange 函数 prop（仅 onUpdateValue），
     v-bind 载荷剥离 onChange/onInput，update:value 桥接至 attrs.onChange -->
<template>
  <NRate v-bind="forwarded" :class="ns.b()" data-testid="cx-naive-ui-rate" @update:value="emitChange" />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { NRate } from 'naive-ui'
import { useCxBEM } from '@lionad/cx-vue'

import { useNaiveUiProps } from '../../shared/use-naive-ui-props'
import { useNaiveChangeBridge } from '../../shared/use-naive-change-bridge'

defineOptions({ name: 'CxNaiveUiRate', inheritAttrs: false })

const ns = useCxBEM('naive-ui-rate')
const naiveProps = useNaiveUiProps(useAttrs())
const { forwarded, emitChange } = useNaiveChangeBridge(naiveProps)
</script>
