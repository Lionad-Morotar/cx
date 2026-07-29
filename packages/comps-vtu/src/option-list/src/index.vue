<template>
  <OptionList v-bind="vtuProps" :class="ns.b()" />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { OptionList } from '@lionad/vtu-components'
import { useCxBEM } from '@lionad/cx-vue'

import { useVtuProps } from '../../shared/use-vtu-props'

import type { OptionListProps } from '@lionad/vtu-components'

defineOptions({ name: 'CxVtuOptionList', inheritAttrs: false })

const ns = useCxBEM('vtu-option-list')
const vtuProps = useVtuProps<OptionListProps>(useAttrs(), 'cx-vtu-option-list')
</script>
