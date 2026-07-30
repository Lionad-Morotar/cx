<!-- CxNaiveUiProgress: 包装 naive-ui NProgress；percentage/type/status/showIndicator 均为其 prop 原样透传 -->
<template>
  <NProgress v-bind="naiveProps" :class="ns.b()" data-testid="cx-naive-ui-progress" />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { NProgress } from 'naive-ui'
import { useCxBEM } from '@lionad/cx-vue'

import { useNaiveUiProps } from '../../shared/use-naive-ui-props'

defineOptions({ name: 'CxNaiveUiProgress', inheritAttrs: false })

const ns = useCxBEM('naive-ui-progress')
const naiveProps = useNaiveUiProps(useAttrs())
</script>
