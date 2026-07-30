<!-- CxNaiveUiAlert: 包装 naive-ui NAlert；title 为其 prop 原样透传，content 经 default slot 注入
     （NAlert 无正文 prop，正文区即默认插槽），透传前剥离 content 以免落 DOM -->
<template>
  <NAlert v-bind="restProps" :class="ns.b()" data-testid="cx-naive-ui-alert">
    {{ content }}
  </NAlert>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { NAlert } from 'naive-ui'
import { useCxBEM } from '@lionad/cx-vue'

import { useNaiveUiProps } from '../../shared/use-naive-ui-props'

defineOptions({ name: 'CxNaiveUiAlert', inheritAttrs: false })

const ns = useCxBEM('naive-ui-alert')
const naiveProps = useNaiveUiProps(useAttrs())
const content = computed(() => (naiveProps.value.content as string | undefined) ?? '')
const restProps = computed(() => {
  const { content: _content, ...rest } = naiveProps.value
  return rest
})
</script>
