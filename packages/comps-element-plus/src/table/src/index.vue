<!-- CxElementPlusTable: 包装 EP ElTable；columns JSON 经 v-for 展开为 ElTableColumn，行值由 EP 按列 key 取值 -->
<template>
  <ElTable :data="rows" v-bind="restProps" :class="ns.b()" data-testid="cx-element-plus-table">
    <ElTableColumn
      v-for="column in columns"
      :key="column.key"
      :prop="column.key"
      :label="column.label"
      :width="column.width"
      :min-width="column.minWidth"
      :sortable="column.sortable"
      :align="column.align"
    />
  </ElTable>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { ElTable, ElTableColumn } from 'element-plus'
import { useCxBEM } from '@lionad/cx-vue'

import { useEpProps } from '../../shared/use-ep-props'

defineOptions({ name: 'CxElementPlusTable', inheritAttrs: false })

interface TableColumn {
  key: string
  label: string
  width?: number | string
  minWidth?: number | string
  sortable?: boolean | 'custom'
  align?: 'left' | 'center' | 'right'
}

const ns = useCxBEM('element-plus-table')
const epProps = useEpProps(useAttrs())
const columns = computed<TableColumn[]>(() => {
  const raw = epProps.value.columns
  return Array.isArray(raw) ? (raw as TableColumn[]) : []
})
// data 经数组守卫后显式绑定（缺席容错为空表），columns 为物料自有配置键须剥离；
// data 是 ElTable 的原生 prop，但直接透传未守卫的 attrs.data 会让非数组值进入 EP
const rows = computed<Record<string, unknown>[]>(() => {
  const raw = epProps.value.data
  return Array.isArray(raw) ? (raw as Record<string, unknown>[]) : []
})
const restProps = computed(() => {
  const { columns: _columns, data: _data, ...rest } = epProps.value
  return rest
})
</script>
