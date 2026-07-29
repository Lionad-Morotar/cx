<!-- CxElementPlusSpace: 包装 EP ElSpace；default 原生插槽供渲染器递归填充子物料 -->
<template>
  <ElSpace v-bind="epProps" :class="ns.b()" data-testid="cx-element-plus-space">
    <slot />
  </ElSpace>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { ElSpace } from 'element-plus'
import { useCxBEM } from '@lionad/cx-vue'

import { useEpProps } from '../../shared/use-ep-props'

defineOptions({ name: 'CxElementPlusSpace', inheritAttrs: false })

const ns = useCxBEM('element-plus-space')
const epProps = useEpProps(useAttrs())
</script>
