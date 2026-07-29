<!-- CxElementPlusTag: 包装 EP ElTag；label 经 default slot 注入（EP 无 label prop） -->
<template>
  <ElTag v-bind="tagProps" :class="ns.b()" data-testid="cx-element-plus-tag">
    {{ label }}
  </ElTag>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { ElTag } from 'element-plus'
import { useCxBEM } from '@lionad/cx-vue'

import { useEpProps } from '../../shared/use-ep-props'

defineOptions({ name: 'CxElementPlusTag', inheritAttrs: false })

const ns = useCxBEM('element-plus-tag')
const epProps = useEpProps(useAttrs())
const label = computed(() => (epProps.value.label as string | undefined) ?? '')
// label 是物料自有配置键（EP ElTag 无此 prop），透传前剥离以免落 DOM
const tagProps = computed(() => {
  const { label: _label, ...rest } = epProps.value
  return rest
})
</script>
