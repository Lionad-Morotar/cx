<!-- CxNaiveUiDivider: 包装 naive-ui NDivider；title 经 default slot 注入线内标题（NDivider 无标题 prop），
     透传前剥离；vertical 模式下 naive 自身忽略插槽内容 -->
<template>
  <NDivider v-bind="dividerProps" :class="ns.b()" data-testid="cx-naive-ui-divider">
    {{ title }}
  </NDivider>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { NDivider } from 'naive-ui'
import { useCxBEM } from '@lionad/cx-vue'

import { useNaiveUiProps } from '../../shared/use-naive-ui-props'

defineOptions({ name: 'CxNaiveUiDivider', inheritAttrs: false })

const ns = useCxBEM('naive-ui-divider')
const naiveProps = useNaiveUiProps(useAttrs())
const title = computed(() => (naiveProps.value.title as string | undefined) ?? '')
const dividerProps = computed(() => {
  const { title: _title, ...rest } = naiveProps.value
  return rest
})
</script>
