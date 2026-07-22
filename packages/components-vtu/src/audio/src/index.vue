<template>
  <Audio v-bind="vtuProps" :class="ns.b()" />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { Audio } from '@lionad/vtu-components'
import { useCxBEM } from '@lionad/cx-vue'

import { useVtuProps } from '../../shared/use-vtu-props'

import type { AudioProps } from '@lionad/vtu-components'

defineOptions({ name: 'CxVtuAudio', inheritAttrs: false })

const ns = useCxBEM('vtu-audio')
const vtuProps = useVtuProps<AudioProps>(useAttrs(), 'cx-vtu-audio')
</script>
