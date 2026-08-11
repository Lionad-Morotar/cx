<!-- CxTanstackChartsDot: 散点图预设物料，通道 props 经 usePresetChart 组装单 mark spec -->
<template>
  <!-- 库根元素 inheritAttrs:false 且多根，testid/BEM 类由本层 wrapper 承担 -->
  <div :class="ns.b()" data-testid="cx-tanstack-charts-dot">
    <Chart v-bind="hostProps" :definition="definition" :aria-label="ariaLabel" />
  </div>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { Chart } from '@tanstack/vue-charts'
import { useCxBEM } from '@lionad/cx-vue'

import { usePresetChart } from '../../shared/use-preset-chart'
import { translateChartSpec } from '../../shared/translate'

defineOptions({ name: 'CxTanstackChartsDot', inheritAttrs: false })

const ns = useCxBEM('tanstack-charts-dot')
const { spec, hostProps, ariaLabel } = usePresetChart(useAttrs(), {
  markType: 'dot',
  xScale: 'linear',
})

// JSON spec → 运行时 DomChartDefinition
const definition = computed(() => translateChartSpec(spec.value))
</script>
