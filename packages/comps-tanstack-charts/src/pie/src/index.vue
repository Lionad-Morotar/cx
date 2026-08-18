<!-- CxTanstackChartsPie: 饼图预设物料，通道 props 经 usePieChart 组装 polar(radialArc) definition -->
<template>
  <!-- 库根元素 inheritAttrs:false 且多根，testid/BEM 类由本层 wrapper 承担。
       cx-charts 为主题桥作用域类：宿主无需手动加类（charts-theme 映射 design token 到 --ts-chart-N/--chart-N） -->
  <div :class="[ns.b(), 'cx-charts']" data-testid="cx-tanstack-charts-pie">
    <Chart v-bind="hostProps" :definition="definition" :aria-label="ariaLabel" />
  </div>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { Chart } from '@tanstack/charts/vue'
import { useCxBEM } from '@lionad/cx-vue'

import { usePieChart } from '../../shared/use-pie-chart'

defineOptions({ name: 'CxTanstackChartsPie', inheritAttrs: false })

const ns = useCxBEM('tanstack-charts-pie')
const { definition, hostProps, ariaLabel } = usePieChart(useAttrs())
</script>
