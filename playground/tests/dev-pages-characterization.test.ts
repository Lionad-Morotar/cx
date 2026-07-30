import { describe, expect, it } from 'vitest'

import { CxBasics, CxCalendar, CxGrid, CxPage, CxUserStyle } from '@lionad/cx-comps'
import { CxNuxtUIV2 } from '@lionad/cx-comps-nuxt-ui-v2'
import { CxNuxtUIV4 } from '@lionad/cx-comps-nuxt-ui-v4'
import { CxVtu } from '@lionad/cx-comps-vtu'
import { CxElementPlus } from '@lionad/cx-comps-element-plus'
import { CxNaiveUi } from '@lionad/cx-comps-naive-ui'
import { groupByCategory as groupV2 } from '../app/dev/nuxt-ui-v2-categories'
import { groupByCategory as groupV4 } from '../app/dev/nuxt-ui-v4-categories'
import { groupByCategory as groupVtu } from '../app/dev/vtu-categories'
import { groupByCategory as groupEp } from '../app/dev/element-plus-categories'
import { groupByCategory as groupNaive } from '../app/dev/naive-ui-categories'
import { toItem, type CxMeta } from '../app/dev/material-utils'

// dev 验收页改版前的特征基线：锁定五集的 group 数与 item 总数。
// 断言只绑定物料数组与 categories 模块（不绑定页面模板），改版后本测试仍可存续，
// 作为「等价迁移」的对照物——任一数字漂移即迁移改变了展示集。

type WithMeta = { _cx_meta: CxMeta }

const asMetas = (arr: unknown): WithMeta[] => arr as WithMeta[]

describe('dev 验收页特征基线（改版前锁定）', () => {
  it('comps：2 组 22 件', () => {
    const basics = asMetas(CxBasics).map(toItem)
    const layout = [CxCalendar, CxGrid, CxPage, CxUserStyle].map((c) => toItem(c as WithMeta))
    expect(basics.length).toBe(18)
    expect(layout.length).toBe(4)
    expect(basics.length + layout.length).toBe(22)
  })

  it('nuxt-ui-v2：6 组 43 件', () => {
    const groups = groupV2(asMetas(CxNuxtUIV2).map(toItem))
    expect(groups.length).toBe(6)
    expect(groups.reduce((s, g) => s + g.items.length, 0)).toBe(43)
  })

  it('nuxt-ui-v4：6 组 70 件', () => {
    const groups = groupV4(asMetas(CxNuxtUIV4).map(toItem))
    expect(groups.length).toBe(6)
    expect(groups.reduce((s, g) => s + g.items.length, 0)).toBe(70)
  })

  it('vtu：6 组 29 件', () => {
    const groups = groupVtu(asMetas(CxVtu).map(toItem))
    expect(groups.length).toBe(6)
    expect(groups.reduce((s, g) => s + g.items.length, 0)).toBe(29)
  })

  it('element-plus：6 组 27 件', () => {
    const groups = groupEp(asMetas(CxElementPlus).map(toItem))
    expect(groups.length).toBe(6)
    expect(groups.reduce((s, g) => s + g.items.length, 0)).toBe(27)
  })

  it('naive-ui：6 组 27 件', () => {
    const groups = groupNaive(asMetas(CxNaiveUi).map(toItem))
    expect(groups.length).toBe(6)
    expect(groups.reduce((s, g) => s + g.items.length, 0)).toBe(27)
  })
})
