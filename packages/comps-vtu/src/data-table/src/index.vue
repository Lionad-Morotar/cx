<template>
  <!--
    vtu DataTable link 列的 <a> 自带 @click.stop(阻止冒泡直达物料根),
    包装件用 click 捕获阶段拦截再 re-emit,统一供 cx 渲染器经 _cx_events 接线(host 侧 hooks 拦截)。
  -->
  <DataTable
    v-bind="vtuProps"
    :class="ns.b()"
    @click.capture="onLinkClick"
  />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { DataTable } from '@lionad/vtu-components'
import { useCxBEM } from '@lionad/cx-vue'

import { useVtuProps } from '../../shared/use-vtu-props'

import type { Column, DataTableProps } from '@lionad/vtu-components'

defineOptions({ name: 'CxVtuDataTable', inheritAttrs: false })

export interface CxDataTableLinkClickPayload {
  rowIndex: number
  text: string
  row: string[]
  column: Column | undefined
  href: string
}

// 列定义既可能叫 label 也可能叫 title,委托层不假设字段名,整列对象原样上抛由 host 自行取用
function onLinkClick(e: MouseEvent): void {
  const target = e.target as HTMLElement | null
  if (!(target instanceof Element)) return
  const anchor = target.closest('a')
  if (!(anchor instanceof HTMLAnchorElement)) return
  e.preventDefault()
  // 表格布局从 tr/td 结构提取行序/列序;cards 布局无表格结构,退化只带锚文案与 href
  const cell = anchor.closest('td')
  const rowEl = anchor.closest('tr')
  const tbody = rowEl?.parentElement
  const rowIndex = rowEl && tbody ? Array.prototype.indexOf.call(tbody.children, rowEl) : -1
  const cellIndex = rowEl && cell ? Array.prototype.indexOf.call(rowEl.children, cell) : -1
  const row = rowEl ? Array.from(rowEl.children).map((c) => c.textContent ?? '') : []
  emit('link-click', {
    rowIndex,
    text: anchor.textContent ?? '',
    row,
    column: cellIndex >= 0 ? vtuProps.value.columns[cellIndex] : undefined,
    href: anchor.getAttribute('href') ?? '',
  })
}

// 与 meta emits 同集合:declare 后这些 on* 从 $attrs 消费,避免 useVtuProps 二次透传造成重复绑定
const emit = defineEmits<{
  'link-click': [payload: CxDataTableLinkClickPayload]
}>()

const ns = useCxBEM('vtu-data-table')
const vtuProps = useVtuProps<DataTableProps>(useAttrs(), 'cx-vtu-data-table')
</script>
