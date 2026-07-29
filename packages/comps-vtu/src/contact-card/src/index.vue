<template>
  <ContactCard v-bind="vtuProps" :class="ns.b()" />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { ContactCard } from '@lionad/vtu-components'
import { useCxBEM } from '@lionad/cx-vue'

import { useVtuProps } from '../../shared/use-vtu-props'

import type { ContactCardProps } from '@lionad/vtu-components'

defineOptions({ name: 'CxVtuContactCard', inheritAttrs: false })

const ns = useCxBEM('vtu-contact-card')
const vtuProps = useVtuProps<ContactCardProps>(useAttrs(), 'cx-vtu-contact-card')
</script>
