<!-- CxNaiveUiDataTable: 包装 naive-ui NDataTable。columns 以 prop 传入（区别于 EP 的 ElTableColumn
     子组件 v-for），wrapper 做 label→title 单点映射（低代码配置键与 EP table 保持一致以跨物料集
     移植 schema，naive DataTableColumn 字段为 title）。data 经数组守卫后显式绑定。 -->
<template>
  <NDataTable :data="rows" :columns="tableColumns" v-bind="restProps" :class="ns.b()" data-testid="cx-naive-ui-data-table" />
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { NDataTable } from 'naive-ui'
import { useCxBEM } from '@lionad/cx-vue'

import { useNaiveUiProps } from '../../shared/use-naive-ui-props'

defineOptions({ name: 'CxNaiveUiDataTable', inheritAttrs: false })

/** 低代码侧配置的列形态；label 经映射落 naive DataTableColumn.title */
interface TableColumn {
  key: string
  label: string
  width?: number | string
  align?: 'left' | 'center' | 'right'
}

const ns = useCxBEM('naive-ui-data-table')
const naiveProps = useNaiveUiProps(useAttrs())
const columns = computed<TableColumn[]>(() => {
  const raw = naiveProps.value.columns
  return Array.isArray(raw) ? (raw as TableColumn[]) : []
})
const tableColumns = computed(() =>
  columns.value.map(({ label, key, width, align }) => ({ key, title: label, width, align })),
)
const rows = computed<Record<string, unknown>[]>(() => {
  const raw = naiveProps.value.data
  return Array.isArray(raw) ? (raw as Record<string, unknown>[]) : []
})
// columns/data 经守卫后显式绑定，透传载荷中剥离以免未守卫值进入 naive
const restProps = computed(() => {
  const { columns: _columns, data: _data, ...rest } = naiveProps.value
  return rest
})
</script>
