<template>
  <GeoMap v-bind="vtuProps" :class="ns.b()" />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { GeoMap } from '@lionad/vtu-components'
import { useCxBEM } from '@lionad/cx-vue'

import { useVtuProps } from '../../shared/use-vtu-props'

import type { GeoMapProps } from '@lionad/vtu-components'

defineOptions({ name: 'CxVtuGeoMap', inheritAttrs: false })

const ns = useCxBEM('vtu-geo-map')
const vtuProps = useVtuProps<GeoMapProps>(useAttrs(), 'cx-vtu-geo-map')
</script>
