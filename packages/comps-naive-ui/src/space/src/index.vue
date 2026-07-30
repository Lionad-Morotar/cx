<!-- CxNaiveUiSpace: 包装 naive-ui NSpace；default 原生插槽供渲染器递归填充子物料 -->
<template>
  <NSpace v-bind="naiveProps" :class="ns.b()" data-testid="cx-naive-ui-space">
    <slot />
  </NSpace>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { NSpace } from 'naive-ui'
import { useCxBEM } from '@lionad/cx-vue'

import { useNaiveUiProps } from '../../shared/use-naive-ui-props'

defineOptions({ name: 'CxNaiveUiSpace', inheritAttrs: false })

const ns = useCxBEM('naive-ui-space')
const naiveProps = useNaiveUiProps(useAttrs())
</script>
