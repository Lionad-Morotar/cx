<template>
  <LinkPreview v-bind="vtuProps" :class="ns.b()" />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { LinkPreview } from '@lionad/vtu-components'
import { useCxBEM } from '@lionad/cx-vue'

import { useVtuProps } from '../../shared/use-vtu-props'

import type { LinkPreviewProps } from '@lionad/vtu-components'

defineOptions({ name: 'CxVtuLinkPreview', inheritAttrs: false })

const ns = useCxBEM('vtu-link-preview')
const vtuProps = useVtuProps<LinkPreviewProps>(useAttrs(), 'cx-vtu-link-preview')
</script>
