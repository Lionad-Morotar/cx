<!-- CxNaiveUiBreadcrumb: 包装 naive-ui NBreadcrumb；items JSON 经 v-for 展开为 NBreadcrumbItem -->
<template>
  <NBreadcrumb :class="ns.b()" data-testid="cx-naive-ui-breadcrumb">
    <NBreadcrumbItem v-for="(item, index) in items" :key="index">
      {{ item.title }}
    </NBreadcrumbItem>
  </NBreadcrumb>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { NBreadcrumb, NBreadcrumbItem } from 'naive-ui'
import { useCxBEM } from '@lionad/cx-vue'

import { useNaiveUiProps } from '../../shared/use-naive-ui-props'

defineOptions({ name: 'CxNaiveUiBreadcrumb', inheritAttrs: false })

/** 低代码侧配置的层级形态 */
interface BreadcrumbItem {
  title: string
}

const ns = useCxBEM('naive-ui-breadcrumb')
const naiveProps = useNaiveUiProps(useAttrs())
const items = computed<BreadcrumbItem[]>(() => {
  const raw = naiveProps.value.items
  return Array.isArray(raw) ? (raw as BreadcrumbItem[]) : []
})
</script>
