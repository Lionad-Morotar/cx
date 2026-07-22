<template>
  <Video v-bind="vtuProps" :class="ns.b()" />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { Video } from '@lionad/vtu-components'
import { useCxBEM } from '@lionad/cx-vue'

import { useVtuProps } from '../../shared/use-vtu-props'

import type { VideoProps } from '@lionad/vtu-components'

defineOptions({ name: 'CxVtuVideo', inheritAttrs: false })

const ns = useCxBEM('vtu-video')
const vtuProps = useVtuProps<VideoProps>(useAttrs(), 'cx-vtu-video')
</script>
