<template>
  <ProgressTracker v-bind="vtuProps" :class="ns.b()" />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { ProgressTracker } from '@lionad/vtu-components'
import { useCxBEM } from '@lionad/cx-vue'

import { useVtuProps } from '../../shared/use-vtu-props'

import type { ProgressTrackerProps } from '@lionad/vtu-components'

defineOptions({ name: 'CxVtuProgressTracker', inheritAttrs: false })

const ns = useCxBEM('vtu-progress-tracker')
const vtuProps = useVtuProps<ProgressTrackerProps>(useAttrs(), 'cx-vtu-progress-tracker')
</script>
