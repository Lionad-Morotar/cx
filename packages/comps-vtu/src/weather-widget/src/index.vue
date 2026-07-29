<template>
  <WeatherWidget v-bind="vtuProps" :class="ns.b()" />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { WeatherWidget } from '@lionad/vtu-components'
import { useCxBEM } from '@lionad/cx-vue'

import { useVtuProps } from '../../shared/use-vtu-props'

import type { WeatherWidgetProps } from '@lionad/vtu-components'

defineOptions({ name: 'CxVtuWeatherWidget', inheritAttrs: false })

const ns = useCxBEM('vtu-weather-widget')
const vtuProps = useVtuProps<WeatherWidgetProps>(useAttrs(), 'cx-vtu-weather-widget')
</script>
