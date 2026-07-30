<!-- CxNaiveUiButton: 包装 naive-ui NButton；label 经 default slot 注入（NButton 无 label prop） -->
<template>
  <NButton v-bind="buttonProps" :class="ns.b()" data-testid="cx-naive-ui-button">
    {{ label }}
  </NButton>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { NButton } from 'naive-ui'
import { useCxBEM } from '@lionad/cx-vue'

import { useNaiveUiProps } from '../../shared/use-naive-ui-props'

defineOptions({ name: 'CxNaiveUiButton', inheritAttrs: false })

const ns = useCxBEM('naive-ui-button')
const naiveProps = useNaiveUiProps(useAttrs())
const label = computed(() => (naiveProps.value.label as string | undefined) ?? '')
// label 是物料自有配置键（NButton 无此 prop），透传前剥离以免被当作未知 attr 落到根 DOM
const buttonProps = computed(() => {
  const { label: _label, ...rest } = naiveProps.value
  return rest
})
</script>
