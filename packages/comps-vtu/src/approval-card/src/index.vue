<template>
  <ApprovalCard v-bind="vtuProps" :class="ns.b()" />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { ApprovalCard } from '@lionad/vtu-components'
import { useCxBEM } from '@lionad/cx-vue'

import { useVtuProps } from '../../shared/use-vtu-props'

import type { ApprovalCardProps } from '@lionad/vtu-components'

defineOptions({ name: 'CxVtuApprovalCard', inheritAttrs: false })

const ns = useCxBEM('vtu-approval-card')
const vtuProps = useVtuProps<ApprovalCardProps>(useAttrs(), 'cx-vtu-approval-card')
</script>
