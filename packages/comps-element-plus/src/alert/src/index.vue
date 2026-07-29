<!-- CxElementPlusAlert: 包装 EP ElAlert；全部配置项为 EP 原生 prop，纯透传 -->
<template>
  <ElAlert v-bind="epProps" :class="ns.b()" data-testid="cx-element-plus-alert" />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { ElAlert } from 'element-plus'
import { useCxBEM } from '@lionad/cx-vue'

import { useEpProps } from '../../shared/use-ep-props'

defineOptions({ name: 'CxElementPlusAlert', inheritAttrs: false })

const ns = useCxBEM('element-plus-alert')
const epProps = useEpProps(useAttrs())
</script>
