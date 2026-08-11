<!-- CxTanstackChartsChart: 通用图表物料，JSON definition 经翻译层组装为 <Chart> 运行时定义 -->
<template>
  <!-- 库根元素 inheritAttrs:false 且多根（host + tooltip Teleport），testid/BEM 类须由本层 wrapper 承担 -->
  <div :class="ns.b()" data-testid="cx-tanstack-charts-chart">
    <Chart v-bind="hostProps" :definition="definition" :aria-label="ariaLabel" />
  </div>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { Chart } from '@tanstack/vue-charts'
import { useCxBEM } from '@lionad/cx-vue'

import { useChartProps } from '../../shared/use-chart-props'
import { translateChartSpec } from '../../shared/translate'

defineOptions({ name: 'CxTanstackChartsChart', inheritAttrs: false })

const ns = useCxBEM('tanstack-charts-chart')
const { spec, hostProps, ariaLabel } = useChartProps(useAttrs())

// JSON spec → 运行时 DomChartDefinition；spec 缺席回退空 marks（由 useChartProps 兜底）
const definition = computed(() => translateChartSpec(spec.value))
</script>
