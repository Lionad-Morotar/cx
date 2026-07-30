<template>
  <!--
    vtu ApprovalCard 的 confirm/cancel 是运行时 emit(非函数 prop),须用 @ 监听再 re-emit;
    与 OptionList 的 action/change(函数 prop,用 :on-*)不同,故此处用 @ 形式。
    re-emit 后统一上抛为包装组件 emits,供 cx 渲染器经 _cx_events 接线。
  -->
  <ApprovalCard
    v-bind="vtuProps"
    :class="ns.b()"
    @confirm="emit('confirm')"
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
  confirm: []
  cancel: []
}>()

const ns = useCxBEM('vtu-approval-card')
const vtuProps = useVtuProps<ApprovalCardProps>(useAttrs(), 'cx-vtu-approval-card')
</script>
