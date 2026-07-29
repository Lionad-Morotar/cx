<!-- CxElementPlusRate: 包装 EP ElRate；纯透传 -->
<template>
  <ElRate v-bind="epProps" :class="ns.b()" data-testid="cx-element-plus-rate" />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { ElRate } from 'element-plus'
import { useCxBEM } from '@lionad/cx-vue'

import { useEpProps } from '../../shared/use-ep-props'

defineOptions({ name: 'CxElementPlusRate', inheritAttrs: false })

const ns = useCxBEM('element-plus-rate')
const epProps = useEpProps(useAttrs())
</script>
