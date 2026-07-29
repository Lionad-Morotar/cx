<!-- CxElementPlusSwitch: 包装 EP ElSwitch；纯透传 -->
<template>
  <ElSwitch v-bind="epProps" :class="ns.b()" data-testid="cx-element-plus-switch" />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { ElSwitch } from 'element-plus'
import { useCxBEM } from '@lionad/cx-vue'

import { useEpProps } from '../../shared/use-ep-props'

defineOptions({ name: 'CxElementPlusSwitch', inheritAttrs: false })

const ns = useCxBEM('element-plus-switch')
const epProps = useEpProps(useAttrs())
</script>
