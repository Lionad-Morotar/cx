<!-- CxElementPlusSteps: 包装 EP ElSteps；steps JSON 经 v-for 展开为 ElStep -->
<template>
  <ElSteps v-bind="restProps" :class="ns.b()" data-testid="cx-element-plus-steps">
    <ElStep
      v-for="(step, index) in steps"
      :key="index"
      :title="step.title"
      :description="step.description"
      :status="step.status"
    />
  </ElSteps>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { ElStep, ElSteps } from 'element-plus'
import { useCxBEM } from '@lionad/cx-vue'

import { useEpProps } from '../../shared/use-ep-props'

defineOptions({ name: 'CxElementPlusSteps', inheritAttrs: false })

/** 低代码侧配置的步骤形态；status 缺省时由 EP 按 active 推导 */
interface StepItem {
  title: string
  description?: string
  status?: 'wait' | 'process' | 'finish' | 'error' | 'success'
}

const ns = useCxBEM('element-plus-steps')
const epProps = useEpProps(useAttrs())
const steps = computed<StepItem[]>(() => {
  const raw = epProps.value.steps
  return Array.isArray(raw) ? (raw as StepItem[]) : []
})
// steps 是物料自有配置键（EP 无此 prop），透传前剥离
const restProps = computed(() => {
  const { steps: _steps, ...rest } = epProps.value
  return rest
})
</script>
