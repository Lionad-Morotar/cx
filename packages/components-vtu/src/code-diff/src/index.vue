<template>
  <CodeDiff v-bind="vtuProps" :class="ns.b()" />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { CodeDiff } from '@lionad/vtu-components'
import { useCxBEM } from '@lionad/cx-vue'

import { useVtuProps } from '../../shared/use-vtu-props'

import type { CodeDiffProps } from '@lionad/vtu-components'

defineOptions({ name: 'CxVtuCodeDiff', inheritAttrs: false })

const ns = useCxBEM('vtu-code-diff')
const vtuProps = useVtuProps<CodeDiffProps>(useAttrs(), 'cx-vtu-code-diff')
</script>
