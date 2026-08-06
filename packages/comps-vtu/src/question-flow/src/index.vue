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
    @select="(optionIds: string[]) => emit('select', optionIds)"
    @back="() => emit('back')"
    @step-change="(stepId: string) => emit('step-change', stepId)"
    @complete="(answers: Record<string, string[]>) => emit('complete', answers)"
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
