<template>
  <XPost v-bind="vtuProps" :class="ns.b()" />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { XPost } from '@lionad/vtu-components'
import { useCxBEM } from '@lionad/cx-vue'

import { useVtuProps } from '../../shared/use-vtu-props'

import type { XPostProps } from '@lionad/vtu-components'

defineOptions({ name: 'CxVtuXPost', inheritAttrs: false })

const ns = useCxBEM('vtu-x-post')
const vtuProps = useVtuProps<XPostProps>(useAttrs(), 'cx-vtu-x-post')
</script>
