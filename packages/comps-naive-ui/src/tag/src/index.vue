<!-- CxNaiveUiTag: 包装 naive-ui NTag；label 经 default slot 注入（NTag 无 label prop），透传前剥离 -->
<template>
  <NTag v-bind="tagProps" :class="ns.b()" data-testid="cx-naive-ui-tag">
    {{ label }}
  </NTag>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { NTag } from 'naive-ui'
import { useCxBEM } from '@lionad/cx-vue'

import { useNaiveUiProps } from '../../shared/use-naive-ui-props'

defineOptions({ name: 'CxNaiveUiTag', inheritAttrs: false })

const ns = useCxBEM('naive-ui-tag')
const naiveProps = useNaiveUiProps(useAttrs())
const label = computed(() => (naiveProps.value.label as string | undefined) ?? '')
const tagProps = computed(() => {
  const { label: _label, ...rest } = naiveProps.value
  return rest
})
</script>
