<!-- CxElementPlusDivider: 包装 EP ElDivider；label 经 default slot 注入（EP 分割线文本即插槽内容） -->
<template>
  <ElDivider v-bind="dividerProps" :class="ns.b()" data-testid="cx-element-plus-divider">
    {{ label }}
  </ElDivider>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { ElDivider } from 'element-plus'
import { useCxBEM } from '@lionad/cx-vue'

import { useEpProps } from '../../shared/use-ep-props'

defineOptions({ name: 'CxElementPlusDivider', inheritAttrs: false })

const ns = useCxBEM('element-plus-divider')
const epProps = useEpProps(useAttrs())
const label = computed(() => (epProps.value.label as string | undefined) ?? '')
// label 是物料自有配置键（EP ElDivider 无此 prop），透传前剥离以免落 DOM
const dividerProps = computed(() => {
  const { label: _label, ...rest } = epProps.value
  return rest
})
</script>
