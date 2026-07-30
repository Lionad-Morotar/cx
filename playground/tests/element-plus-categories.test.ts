import { describe, expect, it } from 'vitest'

import { CxElementPlus } from '@lionad/cx-comps-element-plus'
import { toItem, type CxMeta } from '../app/dev/material-utils'
import { EP_FROZEN_KEYS, groupByCategory } from '../app/dev/element-plus-categories'

/**
 * element-plus 分类完备性契约：物料 key 集与包冻结清单双向相等，且 groupByCategory 全覆盖不抛错。
 * 新增/删除物料必须同步 EP_FROZEN_KEYS 与 CATEGORY_BY_KEY，否则此处立刻暴露。
 */
describe('element-plus 分类完备性', () => {
  it('冻结清单与物料 key 集双向相等（27）', () => {
    const materialKeys = new Set(
      (CxElementPlus as unknown as { _cx_meta: CxMeta }[]).map((m) =>
        m._cx_meta.key.replace(/^cx-element-plus-/, ''),
      ),
    )
    const frozenKeys = new Set<string>(EP_FROZEN_KEYS)
    expect(materialKeys.size).toBe(27)
    expect([...materialKeys].filter((k) => !frozenKeys.has(k))).toEqual([])
    expect([...frozenKeys].filter((k) => !materialKeys.has(k))).toEqual([])
  })

  it('groupByCategory 对全部物料分组且不抛错，合计 27', () => {
    const items = (CxElementPlus as unknown as { _cx_meta: CxMeta }[]).map(toItem)
    const groups = groupByCategory(items)
    const total = groups.reduce((sum, g) => sum + g.items.length, 0)
    expect(total).toBe(27)
  })
})
