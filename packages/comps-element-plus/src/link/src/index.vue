<!-- CxElementPlusLink: 包装 EP ElLink；label 经 default slot 注入（EP 无 label prop） -->
<template>
  <ElLink v-bind="linkProps" :class="ns.b()" data-testid="cx-element-plus-link">
    {{ label }}
  </ElLink>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { ElLink } from 'element-plus'
import { useCxBEM } from '@lionad/cx-vue'

import { useEpProps } from '../../shared/use-ep-props'

defineOptions({ name: 'CxElementPlusLink', inheritAttrs: false })

const ns = useCxBEM('element-plus-link')
const epProps = useEpProps(useAttrs())
const label = computed(() => (epProps.value.label as string | undefined) ?? '')
// label 是物料自有配置键（EP ElLink 无此 prop），透传前剥离以免落 DOM
const linkProps = computed(() => {
  const { label: _label, ...rest } = epProps.value
  return rest
})
</script>
