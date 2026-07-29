<!-- CxElementPlusDescriptions: 包装 EP ElDescriptions；items JSON 经 v-for 展开为 ElDescriptionsItem -->
<template>
  <ElDescriptions v-bind="restProps" :class="ns.b()" data-testid="cx-element-plus-descriptions">
    <ElDescriptionsItem
      v-for="(item, index) in items"
      :key="index"
      :label="item.label"
      :span="item.span"
    >
      {{ item.value }}
    </ElDescriptionsItem>
  </ElDescriptions>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { ElDescriptions, ElDescriptionsItem } from 'element-plus'
import { useCxBEM } from '@lionad/cx-vue'

import { useEpProps } from '../../shared/use-ep-props'

defineOptions({ name: 'CxElementPlusDescriptions', inheritAttrs: false })

/** 低代码侧配置的条目形态；span 缺省时由 EP 按 1 处理 */
interface DescriptionItem {
  label: string
  value: string
  span?: number
}

const ns = useCxBEM('element-plus-descriptions')
const epProps = useEpProps(useAttrs())
const items = computed<DescriptionItem[]>(() => {
  const raw = epProps.value.items
  return Array.isArray(raw) ? (raw as DescriptionItem[]) : []
})
// items 是物料自有配置键（EP 无此 prop），透传前剥离
const restProps = computed(() => {
  const { items: _items, ...rest } = epProps.value
  return rest
})
</script>
