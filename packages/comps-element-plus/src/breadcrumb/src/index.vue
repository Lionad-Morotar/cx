<!-- CxElementPlusBreadcrumb: 包装 EP ElBreadcrumb；items JSON 经 v-for 展开为 ElBreadcrumbItem -->
<template>
  <ElBreadcrumb v-bind="restProps" :class="ns.b()" data-testid="cx-element-plus-breadcrumb">
    <ElBreadcrumbItem v-for="(item, index) in items" :key="index">
      {{ item.label }}
    </ElBreadcrumbItem>
  </ElBreadcrumb>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { ElBreadcrumb, ElBreadcrumbItem } from 'element-plus'
import { useCxBEM } from '@lionad/cx-vue'

import { useEpProps } from '../../shared/use-ep-props'

defineOptions({ name: 'CxElementPlusBreadcrumb', inheritAttrs: false })

interface BreadcrumbItem {
  label: string
}

const ns = useCxBEM('element-plus-breadcrumb')
const epProps = useEpProps(useAttrs())
const items = computed<BreadcrumbItem[]>(() => {
  const raw = epProps.value.items
  return Array.isArray(raw) ? (raw as BreadcrumbItem[]) : []
})
// items 是物料自有配置键（EP 无此 prop），透传前剥离
const restProps = computed(() => {
  const { items: _items, ...rest } = epProps.value
  return rest
})
</script>
