<template>
  <!--
    vtu QuestionFlow 的 select/back/step-change/complete 是函数型 prop(非 Vue emit),
    包装件 :on-* 绑定回调再 re-emit,统一上抛供 cx 渲染器经 _cx_events 接线(host 侧 hooks 拦截)。
  -->
  <QuestionFlow
    v-bind="vtuProps"
    :class="ns.b()"
    :on-select="(optionIds: string[]) => emit('select', optionIds)"
    :on-back="() => emit('back')"
    :on-step-change="(stepId: string) => emit('step-change', stepId)"
    :on-complete="(answers: Record<string, string[]>) => emit('complete', answers)"
  />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { QuestionFlow } from '@lionad/vtu-components'
import { useCxBEM } from '@lionad/cx-vue'

import { useVtuProps } from '../../shared/use-vtu-props'

import type { QuestionFlowProps } from '@lionad/vtu-components'

defineOptions({ name: 'CxVtuQuestionFlow', inheritAttrs: false })

// 与 meta emits 同集合:declare 后这些 on* 从 $attrs 消费,避免 useVtuProps 二次透传造成重复绑定
const emit = defineEmits<{
  select: [optionIds: string[]]
  back: []
  'step-change': [stepId: string]
  complete: [answers: Record<string, string[]>]
}>()

const ns = useCxBEM('vtu-question-flow')
const vtuProps = useVtuProps<QuestionFlowProps>(useAttrs(), 'cx-vtu-question-flow')
</script>
