<!-- CxNaiveUiSlider: 包装 naive-ui NSlider。桥接族：NSlider 无 onChange 函数 prop（仅 onUpdateValue），
     v-bind 载荷剥离 onChange/onInput，update:value 桥接至 attrs.onChange -->
<template>
  <NSlider v-bind="forwarded" :class="ns.b()" data-testid="cx-naive-ui-slider" @update:value="emitChange" />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { NSlider } from 'naive-ui'
import { useCxBEM } from '@lionad/cx-vue'

import { useNaiveUiProps } from '../../shared/use-naive-ui-props'
import { useNaiveChangeBridge } from '../../shared/use-naive-change-bridge'

defineOptions({ name: 'CxNaiveUiSlider', inheritAttrs: false })

const ns = useCxBEM('naive-ui-slider')
const naiveProps = useNaiveUiProps(useAttrs())
const { forwarded, emitChange } = useNaiveChangeBridge(naiveProps)
</script>
