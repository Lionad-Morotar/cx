<template>
  <Image v-bind="vtuProps" :class="ns.b()" />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { Image } from '@lionad/vtu-components'
import { useCxBEM } from '@lionad/cx-vue'

import { useVtuProps } from '../../shared/use-vtu-props'

import type { ImageProps } from '@lionad/vtu-components'

defineOptions({ name: 'CxVtuImage', inheritAttrs: false })

const ns = useCxBEM('vtu-image')
const vtuProps = useVtuProps<ImageProps>(useAttrs(), 'cx-vtu-image')
</script>
