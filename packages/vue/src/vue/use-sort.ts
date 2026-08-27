import { ref, shallowRef, watchEffect } from 'vue'

import type { Ref } from 'vue'

type Sort = { field: string; order: 'asc' | 'desc' }

type UseSortOptions<T> = {
  records: Ref<T[]>
  sorted?: Ref<T[]>
  defaultValues?: Sort[]
}

/** 单值比较：null/undefined 兜底排最后（与方向无关），数值按数值序，其余按本地化字符串序 */
const compareValue = (a: unknown, b: unknown): number => {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b))
}

/** 多字段依次比较：按 sorts 顺序，后面的字段仅在前序字段相等时生效 */
const compareBySorts = <T>(a: T, b: T, sorts: Sort[]): number => {
  for (const { field, order } of sorts) {
    const result = compareValue((a as Record<string, unknown>)[field], (b as Record<string, unknown>)[field])
    if (result !== 0) return order === 'desc' ? -result : result
  }
  return 0
}

/** 排序的响应式封装（原为 p-ray use-sort）。
 *  曾依赖 anysort——其依赖链 anymatch → picomatch@2 在模块加载期即读 process.platform，
 *  浏览器端 ReferenceError；且 anysort@2 的裸函数调用已不原地排序（历史静默失效）。
 *  现内联 comparator 实现，零 Node 生态依赖，浏览器安全。 */
export const useAnysort = <T>(opts: UseSortOptions<T>) => {
  const records: Ref<T[]> = opts.sorted || ref([])
  const sorts = shallowRef<Sort[]>(opts.defaultValues || [])
  const init = () => (records.value = [...opts.records.value])

  const sort = (field: string, order: 'asc' | 'desc') => {
    if (!sorts.value.find((s) => s.field === field)) {
      sorts.value = [{ field, order }]
    } else {
      sorts.value = sorts.value.map((s) => (s.field === field ? { field, order } : s))
    }
  }

  const toggle = (field: string, dft?: 'asc' | 'desc') => {
    const sort = sorts.value.find((s) => s.field === field)
    if (sort) {
      sort.order = (sort.order === 'asc' ? 'desc' : 'asc') as 'asc' | 'desc'
    } else {
      sorts.value = [{ field, order: dft as 'asc' | 'desc' }]
    }
  }

  watchEffect(() => {
    if (sorts.value.length) {
      records.value = [...opts.records.value].sort((a, b) => compareBySorts(a, b, sorts.value))
    } else {
      records.value = [...opts.records.value]
    }
  })

  return {
    init,
    sorted: records,
    sorts,
    sort,
    toggle,
  }
}

export type UseSort = typeof useAnysort
export type UseSortReturn = ReturnType<typeof useAnysort>
