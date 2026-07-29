<template>
  <Plan v-bind="vtuProps" :class="ns.b()" />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { Plan } from '@lionad/vtu-components'
import { useCxBEM } from '@lionad/cx-vue'

import { useVtuProps } from '../../shared/use-vtu-props'

import type { PlanProps } from '@lionad/vtu-components'

defineOptions({ name: 'CxVtuPlan', inheritAttrs: false })

const ns = useCxBEM('vtu-plan')
const vtuProps = useVtuProps<PlanProps>(useAttrs(), 'cx-vtu-plan')
</script>
