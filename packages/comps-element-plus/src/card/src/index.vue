<!-- CxElementPlusCard: 包装 EP ElCard；default/header 原生插槽供渲染器递归填充子物料 -->
<template>
  <ElCard v-bind="epProps" :class="ns.b()" data-testid="cx-element-plus-card">
    <template #header>
      <slot name="header" />
    </template>
    <slot />
  </ElCard>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { ElCard } from 'element-plus'
import { useCxBEM } from '@lionad/cx-vue'

import { useEpProps } from '../../shared/use-ep-props'

defineOptions({ name: 'CxElementPlusCard', inheritAttrs: false })

const ns = useCxBEM('element-plus-card')
const epProps = useEpProps(useAttrs())
</script>
