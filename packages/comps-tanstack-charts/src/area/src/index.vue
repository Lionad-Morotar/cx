<!-- CxTanstackChartsArea: 面积图预设物料，通道 props 经 usePresetChart 组装单 mark spec -->
<template>
  <!-- 库根元素 inheritAttrs:false 且多根，testid/BEM 类由本层 wrapper 承担。
       cx-charts 为主题桥作用域类：宿主无需手动加类（charts-theme 映射 design token 到 --ts-chart-N/--chart-N） -->
  <div :class="[ns.b(), 'cx-charts']" data-testid="cx-tanstack-charts-area">
    <Chart v-bind="hostProps" :definition="definition" :aria-label="ariaLabel" />
  </div>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { Chart } from '@tanstack/charts/vue'
import { useCxBEM } from '@lionad/cx-vue'

import { usePresetChart } from '../../shared/use-preset-chart'
import { translateChartSpec } from '../../shared/translate'

defineOptions({ name: 'CxTanstackChartsArea', inheritAttrs: false })

const ns = useCxBEM('tanstack-charts-area')
const { spec, hostProps, ariaLabel } = usePresetChart(useAttrs(), {
  markType: 'areaY',
  xScale: 'point',
  withCurve: true,
})

// JSON spec → 运行时 StaticChartDefinition
const definition = computed(() => translateChartSpec(spec.value))
</script>
