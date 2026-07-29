<template>
  <Terminal v-bind="vtuProps" :class="ns.b()" />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { Terminal } from '@lionad/vtu-components'
import { useCxBEM } from '@lionad/cx-vue'

import { useVtuProps } from '../../shared/use-vtu-props'

import type { TerminalProps } from '@lionad/vtu-components'

defineOptions({ name: 'CxVtuTerminal', inheritAttrs: false })

const ns = useCxBEM('vtu-terminal')
const vtuProps = useVtuProps<TerminalProps>(useAttrs(), 'cx-vtu-terminal')
</script>
