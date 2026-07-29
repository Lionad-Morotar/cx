<!-- CxElementPlusInput: 包装 EP ElInput；modelValue/onInput/onChange 均经 attrs 原样透传（D5 原生事件通道） -->
<template>
  <ElInput v-bind="epProps" :class="ns.b()" data-testid="cx-element-plus-input" />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { ElInput } from 'element-plus'
import { useCxBEM } from '@lionad/cx-vue'

import { useEpProps } from '../../shared/use-ep-props'

defineOptions({ name: 'CxElementPlusInput', inheritAttrs: false })

const ns = useCxBEM('element-plus-input')
const epProps = useEpProps(useAttrs())
</script>
