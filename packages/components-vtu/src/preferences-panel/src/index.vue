<template>
  <PreferencesPanel v-bind="vtuProps" :class="ns.b()" />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { PreferencesPanel } from '@lionad/vtu-components'
import { useCxBEM } from '@lionad/cx-vue'

import { useVtuProps } from '../../shared/use-vtu-props'

import type { PreferencesPanelProps } from '@lionad/vtu-components'

defineOptions({ name: 'CxVtuPreferencesPanel', inheritAttrs: false })

const ns = useCxBEM('vtu-preferences-panel')
const vtuProps = useVtuProps<PreferencesPanelProps>(useAttrs(), 'cx-vtu-preferences-panel')
</script>
