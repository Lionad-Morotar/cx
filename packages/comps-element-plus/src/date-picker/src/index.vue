<!-- CxElementPlusDatePicker: 包装 EP ElDatePicker；纯透传（面板 teleport 到 body，触发时渲染） -->
<template>
  <ElDatePicker v-bind="epProps" :class="ns.b()" data-testid="cx-element-plus-date-picker" />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { ElDatePicker } from 'element-plus'
import { useCxBEM } from '@lionad/cx-vue'

import { useEpProps } from '../../shared/use-ep-props'

defineOptions({ name: 'CxElementPlusDatePicker', inheritAttrs: false })

const ns = useCxBEM('element-plus-date-picker')
const epProps = useEpProps(useAttrs())
</script>
