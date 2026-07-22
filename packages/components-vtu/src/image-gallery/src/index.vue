<template>
  <ImageGallery v-bind="vtuProps" :class="ns.b()" />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { ImageGallery } from '@lionad/vtu-components'
import { useCxBEM } from '@lionad/cx-vue'

import { useVtuProps } from '../../shared/use-vtu-props'

import type { ImageGalleryProps } from '@lionad/vtu-components'

defineOptions({ name: 'CxVtuImageGallery', inheritAttrs: false })

const ns = useCxBEM('vtu-image-gallery')
const vtuProps = useVtuProps<ImageGalleryProps>(useAttrs(), 'cx-vtu-image-gallery')
</script>
