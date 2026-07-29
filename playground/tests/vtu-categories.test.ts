import { describe, expect, it } from 'vitest'

import { CxVtu } from '@lionad/cx-comps-vtu'
import { toItem, type CxMeta } from '../app/dev/material-utils'
import { VTU_OFFICIAL_KEYS, groupByCategory } from '../app/dev/vtu-categories'

/**
 * vtu 分类完备性契约：物料 key 集与官方清单双向相等，且 groupByCategory 全覆盖不抛错。
 * 新增/删除物料必须同步 VTU_OFFICIAL_KEYS 与 CATEGORY_BY_KEY，否则此处立刻暴露。
 */
describe('vtu 分类完备性', () => {
  it('官方清单与物料 key 集双向相等（29）', () => {
    const materialKeys = new Set(
      (CxVtu as unknown as { _cx_meta: CxMeta }[]).map((m) =>
        m._cx_meta.key.replace(/^cx-vtu-/, ''),
      ),
    )
    const officialKeys = new Set<string>(VTU_OFFICIAL_KEYS)
    expect(materialKeys.size).toBe(29)
    expect([...materialKeys].filter((k) => !officialKeys.has(k))).toEqual([])
    expect([...officialKeys].filter((k) => !materialKeys.has(k))).toEqual([])
  })

  it('groupByCategory 对全部物料分组且不抛错，合计 29', () => {
    const items = (CxVtu as unknown as { _cx_meta: CxMeta }[]).map(toItem)
    const groups = groupByCategory(items)
    const total = groups.reduce((sum, g) => sum + g.items.length, 0)
    expect(total).toBe(29)
  })
})
