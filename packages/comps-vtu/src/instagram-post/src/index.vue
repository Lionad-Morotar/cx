<template>
  <InstagramPost v-bind="vtuProps" :class="ns.b()" />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { InstagramPost } from '@lionad/vtu-components'
import { useCxBEM } from '@lionad/cx-vue'

import { useVtuProps } from '../../shared/use-vtu-props'

import type { InstagramPostProps } from '@lionad/vtu-components'

defineOptions({ name: 'CxVtuInstagramPost', inheritAttrs: false })

const ns = useCxBEM('vtu-instagram-post')
const vtuProps = useVtuProps<InstagramPostProps>(useAttrs(), 'cx-vtu-instagram-post')
</script>
