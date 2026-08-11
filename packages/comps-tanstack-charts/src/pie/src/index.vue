<!-- CxTanstackChartsPie: 饼图预设物料，通道 props 经 usePieChart 组装 polar(radialArc) definition -->
<template>
  <!-- 库根元素 inheritAttrs:false 且多根，testid/BEM 类由本层 wrapper 承担 -->
  <div :class="ns.b()" data-testid="cx-tanstack-charts-pie">
    <Chart v-bind="hostProps" :definition="definition" :aria-label="ariaLabel" />
  </div>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { Chart } from '@tanstack/vue-charts'
import { useCxBEM } from '@lionad/cx-vue'

import { usePieChart } from '../../shared/use-pie-chart'

defineOptions({ name: 'CxTanstackChartsPie', inheritAttrs: false })

const ns = useCxBEM('tanstack-charts-pie')
const { definition, hostProps, ariaLabel } = usePieChart(useAttrs())
</script>
