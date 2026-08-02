<template>
  <div ref="comp" :class="ns.b()" v-bind="attrs">
    <UTable v-bind="tableBinds" @select:all="$emit('select:all', $event)">
      <template v-for="(_, name) in $slots" #[name]="x">
        <slot v-if="showSlot(name)" :name="name as unknown as string" v-bind="x" />
      </template>
    </UTable>
  </div>
</template>

<script setup lang="ts">
import { useTable } from '@lionad/cx-vue'
import type { UseTableReturn } from '@lionad/cx-vue'
import { has } from '@lionad/cx-definition'

import { useAttrs, useTemplateRef, computed } from 'vue'
import type { UnwrapRef } from 'vue'

import { UTable } from '../../../vendor/bridge'

import { useCxSlot, useCxBEM } from '@lionad/cx-vue'
import type { CxComponentRuntime, ComponentProps } from '@lionad/cx-definition'
import type { Column, Data } from '../types'

defineOptions({ name: 'CxTable' })

type UTableProps = ComponentProps<typeof UTable>

const ns = useCxBEM('table')
const inner = defineProps<{}>()
// columns/sorts 承载给 useTable.init 的可见性映射与排序项，须与 init 的参数契约同形；
// 与 UTableProps 的同名键 Omit 后重声明，避免交叉出「数组 & Ref」的不可达类型。
const props = useAttrs() as Omit<UTableProps, 'columns' | 'sorts'> & {
  comp: CxComponentRuntime
  datas?: Data[]
  columns?: UnwrapRef<UseTableReturn['colsVisible']>
  sorts?: UnwrapRef<UseTableReturn['colsSort']>
  showSelect?: boolean
}
const { showSlot } = useCxSlot(props.comp)

const compRef = useTemplateRef('comp')
const ui = computed(() => {})

const attrs = computed(() => ({}))

const table = useTable()
// colsVisible 空值回退 {}：与旧 [] 在 init 读路径（_colsVisible[col.field]）上等价，均为缺席
table.init({
  useNewColsVisible: true,
  records: props.datas || [],
  colsVisible: props.columns || {},
  colsSort: props.sorts || [],
})

const columns = computed(() =>
  table.filteredColumns.value.map((x: any) => {
    return {
      key: x.field,
      label: x.title,
    }
  }),
)
const tableBinds = computed(() => {
  const cols = [...columns.value]
  if (props.showSelect) {
    cols.unshift({
      key: 'select',
      label: '',
    })
  }
  const binds = {
    rows: table.sorted.value,
    columns: cols,
    singleSelect: has(props.singleSelect),
  }
  if (!binds.columns?.length) {
    delete (binds as any).columns
  }
  return binds
})

defineExpose({
  table,
  columns,
  useTable: () => table,
})
</script>

<style lang="scss">
@use '@lionad/cx-vue/styles' as *;

@layer cx {
  @include b('table') {
    // ...
  }
}
</style>
