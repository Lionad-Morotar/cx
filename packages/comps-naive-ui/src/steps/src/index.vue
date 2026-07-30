<!-- CxNaiveUiSteps: 包装 naive-ui NSteps；steps JSON 经 v-for 展开为 NStep，active 映射到 naive
     的 current（1 起序号，与 EP 的 0 起 active 不同，此处对齐 naive 原生约定避免 ±1 换算歧义） -->
<template>
  <NSteps v-bind="restProps" :current="active" :class="ns.b()" data-testid="cx-naive-ui-steps">
    <NStep v-for="(step, index) in steps" :key="index" :title="step.title" :description="step.description" />
  </NSteps>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { NStep, NSteps } from 'naive-ui'
import { useCxBEM } from '@lionad/cx-vue'

import { useNaiveUiProps } from '../../shared/use-naive-ui-props'

defineOptions({ name: 'CxNaiveUiSteps', inheritAttrs: false })

/** 低代码侧配置的步骤形态 */
interface StepItem {
  title: string
  description?: string
}

const ns = useCxBEM('naive-ui-steps')
const naiveProps = useNaiveUiProps(useAttrs())
const steps = computed<StepItem[]>(() => {
  const raw = naiveProps.value.steps
  return Array.isArray(raw) ? (raw as StepItem[]) : []
})
const active = computed(() => {
  const raw = naiveProps.value.active
  return typeof raw === 'number' ? raw : 1
})
// steps/active 为物料自有配置键，透传前剥离（current 已单独绑定）
const restProps = computed(() => {
  const { steps: _steps, active: _active, ...rest } = naiveProps.value
  return rest
})
</script>
