<!-- CxNaiveUiCard: 包装 naive-ui NCard；default/header 原生插槽供渲染器递归填充子物料。
     header 仅经插槽（NCard 的 title prop 与 #header 插槽互斥，恒渲染插槽使 title 失效，故不提供 title 配置） -->
<template>
  <NCard v-bind="naiveProps" :class="ns.b()" data-testid="cx-naive-ui-card">
    <template #header>
      <slot name="header" />
    </template>
    <slot />
  </NCard>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { NCard } from 'naive-ui'
import { useCxBEM } from '@lionad/cx-vue'

import { useNaiveUiProps } from '../../shared/use-naive-ui-props'

defineOptions({ name: 'CxNaiveUiCard', inheritAttrs: false })

const ns = useCxBEM('naive-ui-card')
const naiveProps = useNaiveUiProps(useAttrs())
</script>
