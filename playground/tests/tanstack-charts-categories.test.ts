import { describe, expect, it } from 'vitest'

import { CxTanstackCharts } from '@lionad/cx-comps-tanstack-charts'
import { toItem, type CxMeta } from '../app/dev/material-utils'
import { TSC_FROZEN_KEYS, groupByCategory, tscShortKey } from '../app/dev/tanstack-charts-categories'

/**
 * tanstack-charts 分类完备性契约：本包无外部权威官方分类可对齐（TanStack Charts 是
 * mark 级底层库），契约语义为「分类清单 ↔ 物料 key 集」两独立维护点的一致性——
 * 物料增删须同步 TSC_FROZEN_KEYS 与 CATEGORY_BY_KEY，否则此处立刻暴露。
 */
describe('tanstack-charts 分类完备性', () => {
  it('分类清单与物料 key 集双向相等', () => {
    const materialKeys = new Set(
      (CxTanstackCharts as unknown as { _cx_meta: CxMeta }[]).map((m) => tscShortKey(m._cx_meta.key)),
    )
    const frozenKeys = new Set<string>(TSC_FROZEN_KEYS)
    expect([...materialKeys].filter((k) => !frozenKeys.has(k))).toEqual([])
    expect([...frozenKeys].filter((k) => !materialKeys.has(k))).toEqual([])
  })

  it('groupByCategory 对全部物料分组且不抛错', () => {
    const items = (CxTanstackCharts as unknown as { _cx_meta: CxMeta }[]).map(toItem)
    const groups = groupByCategory(items)
    const total = groups.reduce((sum, g) => sum + g.items.length, 0)
    expect(total).toBe(CxTanstackCharts.length)
  })
})
