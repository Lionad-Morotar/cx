<!-- CxNaiveUiBadge: 包装 naive-ui NBadge；content 经 default slot 注入宿主内容（徽标宿主即插槽），
     透传前剥离 content 以免落 DOM -->
<template>
  <NBadge v-bind="restProps" :class="ns.b()" data-testid="cx-naive-ui-badge">
    {{ content }}
  </NBadge>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { NBadge } from 'naive-ui'
import { useCxBEM } from '@lionad/cx-vue'

import { useNaiveUiProps } from '../../shared/use-naive-ui-props'

defineOptions({ name: 'CxNaiveUiBadge', inheritAttrs: false })

const ns = useCxBEM('naive-ui-badge')
const naiveProps = useNaiveUiProps(useAttrs())
const content = computed(() => (naiveProps.value.content as string | undefined) ?? '')
const restProps = computed(() => {
  const { content: _content, ...rest } = naiveProps.value
  return rest
})
</script>
