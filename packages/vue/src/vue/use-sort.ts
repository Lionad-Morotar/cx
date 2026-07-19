import { computed, ref, shallowRef, watchEffect } from 'vue'
import { anysort } from 'anysort'

import type { Ref } from 'vue'

type Sort = { field: string, order: 'asc' | 'desc' }

type UseSortOptions<T> = {
  records: Ref<T[]>
  sorted?: Ref<T[]>
  defaultValues?: Sort[]
}

/** anysort 的响应式封装（原为 p-ray use-sort；autoSort 关闭，手动驱动） */
export const useAnysort = <T>(opts: UseSortOptions<T>) => {
  anysort.config.autoSort = false

  const records: Ref<T[]> = opts.sorted || ref([])
  const sorts = shallowRef<Sort[]>(opts.defaultValues || [])
  const init = () => records.value = [...opts.records.value]

  const sort = (field: string, order: 'asc' | 'desc') => {
    if (!sorts.value.find(s => s.field === field)) {
      sorts.value = [{ field, order }]
    } else {
      sorts.value = sorts.value.map(s => s.field === field ? { field, order } : s)
    }
  }

  const toggle = (field: string, dft?: 'asc' | 'desc') => {
    const sort = sorts.value.find(s => s.field === field)
    if (sort) {
      sort.order = (sort.order === 'asc' ? 'desc' : 'asc') as 'asc' | 'desc'
    } else {
      sorts.value = [{ field, order: dft as 'asc' | 'desc' }]
    }
  }

  const sortPlugins = computed(() => sorts.value.map(({ field, order }) => {
    return `${field}-${order}()`
  }))
  watchEffect(() => {
    if (sortPlugins.value.length) {
      anysort(records.value, ...sortPlugins.value as any)
    } else {
      records.value = [...opts.records.value]
    }
  })

  return {
    init,
    sorted: records,
    sorts,
    sort,
    toggle
  }
}

export type UseSort = typeof useAnysort
export type UseSortReturn = ReturnType<typeof useAnysort>
