<template>
  <!--
    vtu QuestionFlow 的 select/back/stepChange/complete 是真 emit(实现只走 emit,不调函数
    prop),必须用 @ 监听——:on-* kebab v-bind 进不了 emit 的 camel 键查找,事件会丢。
    注意 vtu 原生事件名是 camelCase 的 stepChange,@step-change 经编译 camelize 后恰好命中;
    re-emit 回宿主侧统一用 kebab 的 step-change(与 meta emits/hydrate _cx_events 同键)。
  -->
  <QuestionFlow
    v-bind="vtuProps"
    :class="ns.b()"
    @select="(optionIds: string[]) => emit('select', toSelectPayload(optionIds))"
    @back="() => emit('back')"
    @step-change="onStepChange"
    @complete="(answers: Record<string, string[]>) => emit('complete', answers)"
  />
</template>

<script setup lang="ts">
import { ref, useAttrs } from 'vue'
import { QuestionFlow } from '@lionad/vtu-components'
import { useCxBEM } from '@lionad/cx-vue'

import { useVtuProps } from '../../shared/use-vtu-props'

import type { QuestionFlowProps } from '@lionad/vtu-components'

/** select 上抛载荷:选项 id 全集 + 翻译后 label + 所在步骤 id(暂存按步骤幂等的锚) */
export interface CxQuestionFlowSelectPayload {
  optionIds: string[]
  labels: string[]
  stepId: string
}

defineOptions({ name: 'CxVtuQuestionFlow', inheritAttrs: false })

// 与 meta emits 同集合:declare 后这些 on* 从 $attrs 消费,避免 useVtuProps 二次透传造成重复绑定
const emit = defineEmits<{
  select: [payload: CxQuestionFlowSelectPayload]
  back: []
  'step-change': [stepId: string]
  complete: [answers: Record<string, string[]>]
}>()

const ns = useCxBEM('vtu-question-flow')
const vtuProps = useVtuProps<QuestionFlowProps>(useAttrs(), 'cx-vtu-question-flow')

/**
 * 当前步骤跟踪:初始首步;vtu 前进与 back 回退都会 fire stepChange 且携带进入的
 * 步骤 id,单通道跟踪即始终准确。select 事件原生载荷只有选项 id、不含步骤标识,
 * 宿主暂存需按步骤幂等(同一步重选替换),故由本组件补上步骤上下文。
 */
const currentStepId = ref<string>(vtuProps.value.steps?.[0]?.id ?? '')

function onStepChange(stepId: string): void {
  currentStepId.value = stepId
  emit('step-change', stepId)
}

/**
 * select 载荷装配:选项 id 翻译为 label(回写对话要用户可读文案,与 option-list
 * change 同契约),查不到退化 id;labels/optionIds 同序对应。
 */
function toSelectPayload(optionIds: string[]): CxQuestionFlowSelectPayload {
  const steps = vtuProps.value.steps ?? []
  const options = steps.find((s) => s.id === currentStepId.value)?.options ?? []
  const labels = optionIds.map((id) => options.find((o) => o.id === id)?.label ?? id)
  return { optionIds, labels, stepId: currentStepId.value }
}
</script>
