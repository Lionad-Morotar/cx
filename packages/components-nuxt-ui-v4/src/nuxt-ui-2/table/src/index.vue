<template>
  <div
    ref="cmpt"
    :class="ns.b()"
    v-bind="attrs"
  >
    <UTable
      v-bind="tableBinds"
      @select:all="$emit('select:all', $event)"
    >
      <template
        v-for="(_, name) in $slots"
        #[name]="x"
      >
        <slot
          v-if="showSlot(name)"
          :name="(name as unknown as string)"
          v-bind="x"
        />
      </template>
    </UTable>
  </div>
</template>

<script setup lang="ts">
import { useTable } from '@lionad/cx-vue'
import type { UseTableReturn } from '@lionad/cx-vue'
import { has } from '@lionad/cx-definition'

import { useAttrs , useTemplateRef, computed} from 'vue'

import { UTable } from '../../../../vendor/bridge'

import { useCxSlot , useCxBEM} from '@lionad/cx-vue'
import type { CxComponentRuntime, ComponentProps } from '@lionad/cx-definition'
import type { Column, Data } from '../types'

defineOptions({ name: 'CxTable' })

type UMeterProps = ComponentProps<typeof UTable>

const ns = useCxBEM('table')
const inner = defineProps<{}>()
const props = useAttrs() as UMeterProps & {
  cmpt: CxComponentRuntime
  datas?: Data[]
  columns?: UseTableReturn['colsVisible']
  sorts?: UseTableReturn['colsSort']
  showSelect?: boolean
}
const { showSlot } = useCxSlot(props.cmpt)

const cmptRef = useTemplateRef('cmpt')
const ui = computed(() => {})

const attrs = computed(() => ({
}))

const table = useTable()
table.init({
  useNewColsVisible: true,
  records: props.datas || [],
  colsVisible: props.columns || [],
  colsSort: props.sorts || []
})

const columns = computed(() => table.filteredColumns.value.map((x: any) => {
  return {
    key: x.field,
    label: x.title
  }
}))
const tableBinds = computed(() => {
  const cols = [...columns.value]
  if (props.showSelect) {
    cols.unshift({
      key: 'select',
      label: ''
    })
  }
  const binds = {
    rows: table.sorted.value,
    columns: cols,
    singleSelect: has(props.singleSelect)
  }
  if (!binds.columns?.length) {
    delete (binds as any).columns
  }
  return binds
})

defineExpose({
  table,
  columns,
  useTable: () => table
})
</script>

<style lang="scss">
@use '../../../styles/index.scss' as *;

$ns: 'cx';

@layer cx {
  @include b('table') {
    // ...
  }
}
</style>
