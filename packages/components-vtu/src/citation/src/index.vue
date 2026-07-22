<template>
  <Citation v-bind="vtuProps" :class="ns.b()" />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { Citation } from '@lionad/vtu-components'
import { useCxBEM } from '@lionad/cx-vue'

import { useVtuProps } from '../../shared/use-vtu-props'

import type { CitationProps } from '@lionad/vtu-components'

defineOptions({ name: 'CxVtuCitation', inheritAttrs: false })

const ns = useCxBEM('vtu-citation')
const vtuProps = useVtuProps<CitationProps>(useAttrs(), 'cx-vtu-citation')
</script>
