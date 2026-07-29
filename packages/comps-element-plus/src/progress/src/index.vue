<!-- CxElementPlusProgress: 包装 EP ElProgress；纯透传 -->
<template>
  <ElProgress v-bind="epProps" :class="ns.b()" data-testid="cx-element-plus-progress" />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { ElProgress } from 'element-plus'
import { useCxBEM } from '@lionad/cx-vue'

import { useEpProps } from '../../shared/use-ep-props'

defineOptions({ name: 'CxElementPlusProgress', inheritAttrs: false })

const ns = useCxBEM('element-plus-progress')
const epProps = useEpProps(useAttrs())
</script>
