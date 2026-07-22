<template>
  <CodeBlock v-bind="vtuProps" :class="ns.b()" />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { CodeBlock } from '@lionad/vtu-components'
import { useCxBEM } from '@lionad/cx-vue'

import { useVtuProps } from '../../shared/use-vtu-props'

import type { CodeBlockProps } from '@lionad/vtu-components'

defineOptions({ name: 'CxVtuCodeBlock', inheritAttrs: false })

const ns = useCxBEM('vtu-code-block')
const vtuProps = useVtuProps<CodeBlockProps>(useAttrs(), 'cx-vtu-code-block')
</script>
