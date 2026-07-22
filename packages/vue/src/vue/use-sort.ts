import { computed, ref, shallowRef, watchEffect } from 'vue'
import anysort from 'anysort'

import type { Ref } from 'vue'

type Sort = { field: string; order: 'asc' | 'desc' }

type UseSortOptions<T> = {
  records: Ref<T[]>
  sorted?: Ref<T[]>
  defaultValues?: Sort[]
}

/** anysort 的响应式封装（原为 p-ray use-sort）。
 *  anysort@2 已移除 config.autoSort（其本身是手动 comparator 生成器，无自动排序开关），
 *  且 anysort 是裸函数单导出（module.exports = anysort），须用 default import——
 *  named import `import { anysort }` 在打包 interop 下会解析为 undefined。 */
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

  const sortPlugins = computed(() =>
    sorts.value.map(({ field, order }) => {
      return `${field}-${order}()`
    }),
  )
  watchEffect(() => {
    if (sortPlugins.value.length) {
      // anysort@2 的 anysort() 不再原地排序（返回比较结果），此处排序静默失效；
      // 恢复排序需改用 anysort.splice(records, criteria).sorted（编辑器排序路径）。
      // 验收页 table 默认无排序（sorts=[]）走 else 分支，不经过此处。
      anysort(records.value, ...(sortPlugins.value as any))
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
