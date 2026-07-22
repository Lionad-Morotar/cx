<template>
  <ParameterSlider v-bind="vtuProps" :class="ns.b()" />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { ParameterSlider } from '@lionad/vtu-components'
import { useCxBEM } from '@lionad/cx-vue'

import { useVtuProps } from '../../shared/use-vtu-props'

import type { ParameterSliderProps } from '@lionad/vtu-components'

defineOptions({ name: 'CxVtuParameterSlider', inheritAttrs: false })

const ns = useCxBEM('vtu-parameter-slider')
const vtuProps = useVtuProps<ParameterSliderProps>(useAttrs(), 'cx-vtu-parameter-slider')
</script>
