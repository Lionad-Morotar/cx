<template>
  <!--
    vtu ApprovalCard 的 confirm/cancel 是真 emit(实现只走 emit,不调函数 prop),
    必须用 @ 监听——:on-* kebab v-bind 进不了 emit 的 camel 键查找,事件会丢。
    confirm 上抛附 confirmLabel(按钮文案即回写语义,未配时 undefined 由语义层落兜底)。
  -->
  <ApprovalCard
    v-bind="vtuProps"
    :class="ns.b()"
    @confirm="emit('confirm', vtuProps.confirmLabel)"
    @cancel="emit('cancel')"
  />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { ApprovalCard } from '@lionad/vtu-components'
import { useCxBEM } from '@lionad/cx-vue'

import { useVtuProps } from '../../shared/use-vtu-props'

import type { ApprovalCardProps } from '@lionad/vtu-components'

defineOptions({ name: 'CxVtuApprovalCard', inheritAttrs: false })

const emit = defineEmits<{
  confirm: [label: string | undefined]
  cancel: []
}>()

const ns = useCxBEM('vtu-approval-card')
const vtuProps = useVtuProps<ApprovalCardProps>(useAttrs(), 'cx-vtu-approval-card')
</script>
