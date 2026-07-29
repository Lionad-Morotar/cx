<!-- CxElementPlusBadge: 包装 EP ElBadge；content 经 default slot 注入（徽标宿主内容即插槽） -->
<template>
  <ElBadge v-bind="badgeProps" :class="ns.b()" data-testid="cx-element-plus-badge">
    {{ content }}
  </ElBadge>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { ElBadge } from 'element-plus'
import { useCxBEM } from '@lionad/cx-vue'

import { useEpProps } from '../../shared/use-ep-props'

defineOptions({ name: 'CxElementPlusBadge', inheritAttrs: false })

const ns = useCxBEM('element-plus-badge')
const epProps = useEpProps(useAttrs())
const content = computed(() => (epProps.value.content as string | undefined) ?? '')
// content 是物料自有配置键（EP ElBadge 无此 prop），透传前剥离以免落 DOM
const badgeProps = computed(() => {
  const { content: _content, ...rest } = epProps.value
  return rest
})
</script>
