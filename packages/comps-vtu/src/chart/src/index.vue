<template>
  <Chart v-bind="vtuProps" :class="ns.b()" />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { Chart } from '@lionad/vtu-components'
import { useCxBEM } from '@lionad/cx-vue'

import { useVtuProps } from '../../shared/use-vtu-props'

import type { ChartProps } from '@lionad/vtu-components'

defineOptions({ name: 'CxVtuChart', inheritAttrs: false })

const ns = useCxBEM('vtu-chart')
const vtuProps = useVtuProps<ChartProps>(useAttrs(), 'cx-vtu-chart')
</script>
