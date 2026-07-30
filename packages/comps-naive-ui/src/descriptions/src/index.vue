<!-- CxNaiveUiDescriptions: 包装 naive-ui NDescriptions；items JSON 经 v-for 展开为 NDescriptionsItem，
     透传前剥离 items 以免落 DOM -->
<template>
  <NDescriptions v-bind="restProps" :class="ns.b()" data-testid="cx-naive-ui-descriptions">
    <NDescriptionsItem
      v-for="(item, index) in items"
      :key="index"
      :label="item.label"
      :span="item.span"
    >
      {{ item.value }}
    </NDescriptionsItem>
  </NDescriptions>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { NDescriptions, NDescriptionsItem } from 'naive-ui'
import { useCxBEM } from '@lionad/cx-vue'

import { useNaiveUiProps } from '../../shared/use-naive-ui-props'

defineOptions({ name: 'CxNaiveUiDescriptions', inheritAttrs: false })

/** 低代码侧配置的条目形态；span 缺省时由 naive 按 1 处理 */
interface DescriptionItem {
  label: string
  value: string
  span?: number
}

const ns = useCxBEM('naive-ui-descriptions')
const naiveProps = useNaiveUiProps(useAttrs())
const items = computed<DescriptionItem[]>(() => {
  const raw = naiveProps.value.items
  return Array.isArray(raw) ? (raw as DescriptionItem[]) : []
})
const restProps = computed(() => {
  const { items: _items, ...rest } = naiveProps.value
  return rest
})
</script>
