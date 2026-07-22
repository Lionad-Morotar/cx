<template>
  <StatsDisplay v-bind="vtuProps" :class="ns.b()" />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { StatsDisplay } from '@lionad/vtu-components'
import { useCxBEM } from '@lionad/cx-vue'

import { useVtuProps } from '../../shared/use-vtu-props'

import type { StatsDisplayProps } from '@lionad/vtu-components'

defineOptions({ name: 'CxVtuStatsDisplay', inheritAttrs: false })

const ns = useCxBEM('vtu-stats-display')
const vtuProps = useVtuProps<StatsDisplayProps>(useAttrs(), 'cx-vtu-stats-display')
</script>
