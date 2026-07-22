<template>
  <MessageDraft v-bind="vtuProps" :class="ns.b()" />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { MessageDraft } from '@lionad/vtu-components'
import { useCxBEM } from '@lionad/cx-vue'

import { useVtuProps } from '../../shared/use-vtu-props'

import type { MessageDraftProps } from '@lionad/vtu-components'

defineOptions({ name: 'CxVtuMessageDraft', inheritAttrs: false })

const ns = useCxBEM('vtu-message-draft')
const vtuProps = useVtuProps<MessageDraftProps>(useAttrs(), 'cx-vtu-message-draft')
</script>
