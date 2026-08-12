<!-- CxTanstackChartsChart: 通用图表物料，JSON definition 经翻译层组装为 <Chart> 运行时定义 -->
<template>
  <!-- 库根元素 inheritAttrs:false 且多根（host + tooltip Teleport），testid/BEM 类须由本层 wrapper 承担 -->
  <div :class="ns.b()" data-testid="cx-tanstack-charts-chart">
    <!-- definition 未闭合期间骨架占位：空壳帧的空 marks 只渲染不可见空 svg，无反馈等同未渲染 -->
    <ChartSkeleton v-if="isStreaming" :height="skeletonHeight" />
    <Chart v-else v-bind="hostProps" :definition="definition" :aria-label="ariaLabel" />
  </div>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { Chart } from '@tanstack/vue-charts'
import { useCxBEM } from '@lionad/cx-vue'

import ChartSkeleton from '../../shared/chart-skeleton.vue'
import { streamingFields } from '../../shared/streaming'
import { useChartProps } from '../../shared/use-chart-props'
import { translateChartSpec } from '../../shared/translate'

defineOptions({ name: 'CxTanstackChartsChart', inheritAttrs: false })

const ns = useCxBEM('tanstack-charts-chart')
const attrs = useAttrs()
const { spec, hostProps, ariaLabel } = useChartProps(attrs)

// JSON spec → 运行时 DomChartDefinition；spec 缺席回退空 marks（由 useChartProps 兜底）
const definition = computed(() => translateChartSpec(spec.value))

// scalar trigger 以 skeletonFields=['definition'] 注入缺席性标记：未闭合期渲染骨架
const isStreaming = computed(() => streamingFields(attrs).includes('definition'))
// 骨架与揭示态等高（height 在 hostProps 白名单内，缺席回退物料 initial 同值）
const skeletonHeight = computed(() => {
  const h = Number(attrs.height)
  return Number.isFinite(h) && h > 0 ? h : 320
})
</script>
