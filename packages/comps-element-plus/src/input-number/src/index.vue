<!-- CxElementPlusInputNumber: 包装 EP ElInputNumber；纯透传 -->
<template>
  <ElInputNumber v-bind="epProps" :class="ns.b()" data-testid="cx-element-plus-input-number" />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { ElInputNumber } from 'element-plus'
import { useCxBEM } from '@lionad/cx-vue'

import { useEpProps } from '../../shared/use-ep-props'

defineOptions({ name: 'CxElementPlusInputNumber', inheritAttrs: false })

const ns = useCxBEM('element-plus-input-number')
const epProps = useEpProps(useAttrs())
</script>
