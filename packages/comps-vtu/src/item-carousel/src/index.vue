<template>
  <ItemCarousel v-bind="vtuProps" :class="ns.b()" />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { ItemCarousel } from '@lionad/vtu-components'
import { useCxBEM } from '@lionad/cx-vue'

import { useVtuProps } from '../../shared/use-vtu-props'

import type { ItemCarouselProps } from '@lionad/vtu-components'

defineOptions({ name: 'CxVtuItemCarousel', inheritAttrs: false })

const ns = useCxBEM('vtu-item-carousel')
const vtuProps = useVtuProps<ItemCarouselProps>(useAttrs(), 'cx-vtu-item-carousel')
</script>
