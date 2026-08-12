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
    @complete="(answers: Record<string, string[]>) => emit('complete', toCompletePayload(answers))"
  />
</template>

<script setup lang="ts">
import { ref, useAttrs } from 'vue'
import { QuestionFlow } from '@lionad/vtu-components'
import { useCxBEM } from '@lionad/cx-vue'

import { useVtuProps } from '../../shared/use-vtu-props'

import type { QuestionFlowUpfrontProps } from '@lionad/vtu-components'

/** select 上抛载荷:选项 id 全集 + 翻译后 label + 所在步骤 id(暂存按步骤幂等的锚) */
export interface CxQuestionFlowSelectPayload {
  optionIds: string[]
  labels: string[]
  stepId: string
}

/**
 * complete 上抛载荷:全量答案 + 每步「已选:label…」摘要。
 * vtu upfront 形态 toggleOption 只写内部 answers、不 fire select(select 仅 progressive
 * 分支),暂存链路收不到选择——complete 载荷是回写唯一信息源,摘要在此翻译;
 * 与 select 暂存 text 同格式,语义层可直接拼接。
 */
export interface CxQuestionFlowCompletePayload {
  answers: Record<string, string[]>
  texts: string[]
}

defineOptions({ name: 'CxVtuQuestionFlow', inheritAttrs: false })

// 与 meta emits 同集合:declare 后这些 on* 从 $attrs 消费,避免 useVtuProps 二次透传造成重复绑定
const emit = defineEmits<{
  select: [payload: CxQuestionFlowSelectPayload]
  back: []
  'step-change': [stepId: string]
  complete: [payload: CxQuestionFlowCompletePayload]
}>()

const ns = useCxBEM('vtu-question-flow')
// 泛型收窄 Upfront(steps 驱动):vtu props 是三形态联合,仅 Upfront 有 steps;
// progressive(单步)/receipt(回执)形态不是本物料承载的契约
const vtuProps = useVtuProps<QuestionFlowUpfrontProps>(useAttrs(), 'cx-vtu-question-flow')

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

/**
 * complete 载荷装配:answers 的选项 id 经各步 options 查表翻译为 label,
 * 每步一条「已选:…」摘要(空答案步骤跳过);查不到退化 id 兜底。
 */
function toCompletePayload(answers: Record<string, string[]>): CxQuestionFlowCompletePayload {
  const steps = vtuProps.value.steps ?? []
  const texts = steps
    .map((s) => {
      const ids = answers[s.id]
      if (!ids?.length) return undefined
      const labels = ids.map((id) => s.options.find((o) => o.id === id)?.label ?? id)
      return `已选:${labels.join(', ')}`
    })
    .filter((t): t is string => typeof t === 'string')
  return { answers, texts }
}
</script>
