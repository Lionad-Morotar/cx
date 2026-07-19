import { computed, ref, watch, watchEffect } from 'vue'
import { tryOnScopeDispose } from '@vueuse/core'
import { has } from '@lionad/cx-definition'
import { useAnysort } from './use-sort'
import { useClone } from './clone'

import type { Ref } from 'vue'



export const useTable = () => {
  const columns = ref<{
    field: string
    title: string
    width?: number
    linkField?: any
    linkModel?: any
  }[]>([])
  const records = ref<Record<string, any>[]>([])

  const filters = ref<any[]>([])
  const filtered = ref<Record<string, any>[]>([])

  const colsSort = ref<{ field: { id: string, name: string }, sort: 'asc' | 'desc' | '' }[]>([])
  const sorted = ref<Record<string, any>[]>([])

  const useNewColsVisible = ref(false)
  const colsVisibleDeprecated = ref<boolean[]>([])
  const colsVisible = ref<Record<string, boolean>>({})
  const filteredColumns = computed(() => {
    return useNewColsVisible.value
      ? columns.value.filter(col => colsVisible.value[col.field])
      : columns.value.filter((col, idx) => colsVisibleDeprecated.value[idx])
  })

  const init = ({
    useNewColsVisible: _useNewColsVisible = false,
    records: _records = [],
    columns: _columns = [],
    sorts: _sorts = [],
    colsVisibleDeprecated: _colsVisibleDeprecated = [],
    colsVisible: _colsVisible = {},
    colsSort: _colsSort = []
  }: any) => {
    useNewColsVisible.value = _useNewColsVisible

    records.value = _records.filter(has)
    const hasRecord = records.value.length > 0

    columns.value = _columns.filter(has)
    const emptyCols = columns.value.length === 0
    if (emptyCols && hasRecord) {
      const firstRecord = records.value[0] || {}
      columns.value = Object.keys(firstRecord).map(key => ({
        field: key,
        title: key
      }))
    }

    colsSort.value = _colsSort.filter(has)
    colsVisibleDeprecated.value = _colsVisibleDeprecated.filter(has)
    colsVisible.value = columns.value.reduce((acc, col) => {
      acc[col.field] = has(_colsVisible[col.field]) as boolean
      return acc
    }, {} as Record<string, boolean>)
    if (useNewColsVisible.value && colsVisibleDeprecated.value.length) {
      colsVisible.value = columns.value.reduce((acc, col, idx) => {
        acc[col.field] = colsVisibleDeprecated.value[idx] as boolean
        return acc
      }, {} as Record<string, boolean>)
    }

    filtered.value = useClone(records.value)
    sorted.value = useClone(records.value)
  }

  tryOnScopeDispose(() => {
    columns.value = []
    records.value = []
    filtered.value = []
    sorted.value = []
  })

  const resetVisibleDeprecated = () => {
    colsVisibleDeprecated.value = columns.value.map(() => true)
  }
  const resetVisible = () => {
    colsVisible.value = columns.value.reduce((acc, col) => {
      acc[col.field] = true
      return acc
    }, {} as Record<string, boolean>)
  }
  const resetSorts = () => {
    colsSort.value = []
  }

  const { sorts, init: initSort } = useAnysort({
    records: filtered,
    sorted
  })

  watch(filtered, initSort)

  // filtered 必须跟随 records：dataset/import 的 parseWorkbook 直接整体替换 records 而不调 init，
  // 若不同步，sorted（= tableRecords）恒为空，下游 p-datatable 拿不到数据。
  // 此 watch 为浅监听，仅响应 records.value 的整体替换（parseWorkbook 与 init 均为此模式），
  // 不捕获原地 push/splice；init 路径下与 init 内赋值幂等，不改变既有行为。
  watch(records, () => {
    filtered.value = useClone(records.value)
  })

  // TODO sliced task
  watchEffect(() => {
    // console.log('filtered backup', filtered.value.length)
    sorts.value = colsSort.value
      .filter(x => x.sort)
      .map((sort) => {
        return {
          field: sort.field.id,
          order: (sort.sort === 'asc' ? 'asc' : sort.sort === 'desc' ? 'desc' : undefined) as 'asc' | 'desc'
        }
      })
  })

  return {
    init,
    initSort,
    filters,
    columns,
    records,
    filtered,
    filteredColumns,
    useNewColsVisible,
    colsVisibleDeprecated,
    colsVisible,
    resetVisibleDeprecated,
    resetVisible,
    sorts,
    colsSort,
    sorted,
    resetSorts
  }
}

export type UseTable = typeof useTable
export type UseTableReturn = ReturnType<typeof useTable>
