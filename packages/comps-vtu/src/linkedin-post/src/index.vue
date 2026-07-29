<template>
  <LinkedInPost v-bind="vtuProps" :class="ns.b()" />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { LinkedInPost } from '@lionad/vtu-components'
import { useCxBEM } from '@lionad/cx-vue'

import { useVtuProps } from '../../shared/use-vtu-props'

import type { LinkedInPostProps } from '@lionad/vtu-components'

defineOptions({ name: 'CxVtuLinkedInPost', inheritAttrs: false })

const ns = useCxBEM('vtu-linkedin-post')
const vtuProps = useVtuProps<LinkedInPostProps>(useAttrs(), 'cx-vtu-linkedin-post')
</script>
