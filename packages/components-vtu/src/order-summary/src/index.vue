<template>
  <OrderSummary v-bind="vtuProps" :class="ns.b()" />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { OrderSummary } from '@lionad/vtu-components'
import { useCxBEM } from '@lionad/cx-vue'

import { useVtuProps } from '../../shared/use-vtu-props'

import type { OrderSummaryProps } from '@lionad/vtu-components'

defineOptions({ name: 'CxVtuOrderSummary', inheritAttrs: false })

const ns = useCxBEM('vtu-order-summary')
const vtuProps = useVtuProps<OrderSummaryProps>(useAttrs(), 'cx-vtu-order-summary')
</script>
