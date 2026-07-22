<template>
  <QuestionFlow v-bind="vtuProps" :class="ns.b()" />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { QuestionFlow } from '@lionad/vtu-components'
import { useCxBEM } from '@lionad/cx-vue'

import { useVtuProps } from '../../shared/use-vtu-props'

import type { QuestionFlowProps } from '@lionad/vtu-components'

defineOptions({ name: 'CxVtuQuestionFlow', inheritAttrs: false })

const ns = useCxBEM('vtu-question-flow')
const vtuProps = useVtuProps<QuestionFlowProps>(useAttrs(), 'cx-vtu-question-flow')
</script>
