<!-- CxNaiveUiSwitch: 包装 naive-ui NSwitch。桥接族：NSwitch 的 onChange 已废弃（保留原生消费会与
     桥接双发），v-bind 载荷剥离 onChange/onInput，update:value 显式桥接至 attrs.onChange -->
<template>
  <NSwitch v-bind="forwarded" :class="ns.b()" data-testid="cx-naive-ui-switch" @update:value="emitChange" />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { NSwitch } from 'naive-ui'
import { useCxBEM } from '@lionad/cx-vue'

import { useNaiveUiProps } from '../../shared/use-naive-ui-props'
import { useNaiveChangeBridge } from '../../shared/use-naive-change-bridge'

defineOptions({ name: 'CxNaiveUiSwitch', inheritAttrs: false })

const ns = useCxBEM('naive-ui-switch')
const naiveProps = useNaiveUiProps(useAttrs())
const { forwarded, emitChange } = useNaiveChangeBridge(naiveProps)
</script>
