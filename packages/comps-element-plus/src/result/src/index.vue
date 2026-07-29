<!-- CxElementPlusResult: 包装 EP ElResult；全部配置项为 EP 原生 prop，纯透传 -->
<template>
  <ElResult v-bind="epProps" :class="ns.b()" data-testid="cx-element-plus-result" />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { ElResult } from 'element-plus'
import { useCxBEM } from '@lionad/cx-vue'

import { useEpProps } from '../../shared/use-ep-props'

defineOptions({ name: 'CxElementPlusResult', inheritAttrs: false })

const ns = useCxBEM('element-plus-result')
const epProps = useEpProps(useAttrs())
</script>
