import { describe, expect, it } from 'vitest'

import { CxNuxtUIV4 } from '@lionad/cx-comps-nuxt-ui-v4'

import { toItem, type CxMeta } from '../app/dev/material-utils'
import {
  groupByCategory,
  NUXT_UI_V4_CATEGORY_ORDER,
  NUXT_UI_V4_OFFICIAL_KEYS,
} from '../app/dev/nuxt-ui-v4-categories'

// 验收页实际装配的物料集合（CxNuxtUIV4 数组，对齐官方核心 6 分类 70 组件）
const materials = CxNuxtUIV4 as unknown as { _cx_meta: CxMeta }[]
const items = materials.map(toItem)

describe('Nuxt UI v4 物料分类', () => {
  it('全部物料均已归类（未映射会抛错）', () => {
    expect(() => groupByCategory(items)).not.toThrow()
  })

  it('恰好分 6 组，与官方分类顺序一致（Layout 首、Overlay 尾）', () => {
    const groups = groupByCategory(items)
    expect(groups.map((g) => g.name)).toEqual([...NUXT_UI_V4_CATEGORY_ORDER])
  })

  it('分组后物料总数守恒（不丢不重）', () => {
    const groups = groupByCategory(items)
    const total = groups.reduce((sum, g) => sum + g.items.length, 0)
    expect(total).toBe(items.length)
  })

  it('每个物料只出现在一个分组（无重复）', () => {
    const groups = groupByCategory(items)
    const seen = new Set<string>()
    for (const g of groups) {
      for (const it of g.items) {
        expect(seen.has(it.meta.key)).toBe(false)
        seen.add(it.meta.key)
      }
    }
    expect(seen.size).toBe(items.length)
  })

  it('官方 70 组件清单与物料 key 集一一对应（双向差集为空）', () => {
    const officialKeys = NUXT_UI_V4_OFFICIAL_KEYS.map((k) => `cx-nuxt-ui-v4-${k}`)
    const materialKeys = materials.map((m) => m._cx_meta.key)
    // 物料有而官方清单无（多做 / 未同步清单）
    expect(materialKeys.filter((k) => !officialKeys.includes(k))).toEqual([])
    // 官方清单有而物料无（缺物料）
    expect(officialKeys.filter((k) => !materialKeys.includes(k))).toEqual([])
  })

  it('关键归属与官方文档一致（含 v2→v4 归属变化物料）', () => {
    const groups = groupByCategory(items)
    const find = (key: string) => groups.find((g) => g.items.some((i) => i.meta.key === key))!.name

    // Layout
    expect(find('cx-nuxt-ui-v4-app')).toBe('Layout')
    expect(find('cx-nuxt-ui-v4-container')).toBe('Layout')
    expect(find('cx-nuxt-ui-v4-sidebar')).toBe('Layout')
    expect(find('cx-nuxt-ui-v4-theme')).toBe('Layout')
    // Element（card / separator / skeleton 在 v2 属 Layout，v4 官方属 Element）
    expect(find('cx-nuxt-ui-v4-card')).toBe('Element')
    expect(find('cx-nuxt-ui-v4-separator')).toBe('Element')
    expect(find('cx-nuxt-ui-v4-skeleton')).toBe('Element')
    expect(find('cx-nuxt-ui-v4-field-group')).toBe('Element')
    // Form
    expect(find('cx-nuxt-ui-v4-input')).toBe('Form')
    expect(find('cx-nuxt-ui-v4-input-date')).toBe('Form')
    expect(find('cx-nuxt-ui-v4-radio-group')).toBe('Form')
    expect(find('cx-nuxt-ui-v4-switch')).toBe('Form')
    // Data（accordion / carousel 在 v2 属 Elements，v4 官方属 Data）
    expect(find('cx-nuxt-ui-v4-accordion')).toBe('Data')
    expect(find('cx-nuxt-ui-v4-carousel')).toBe('Data')
    expect(find('cx-nuxt-ui-v4-table')).toBe('Data')
    // Navigation（link 在 v2 属 Elements，v4 官方属 Navigation）
    expect(find('cx-nuxt-ui-v4-link')).toBe('Navigation')
    expect(find('cx-nuxt-ui-v4-navigation-menu')).toBe('Navigation')
    expect(find('cx-nuxt-ui-v4-stepper')).toBe('Navigation')
    // Overlay
    expect(find('cx-nuxt-ui-v4-modal')).toBe('Overlay')
    expect(find('cx-nuxt-ui-v4-toast')).toBe('Overlay')
    expect(find('cx-nuxt-ui-v4-drawer')).toBe('Overlay')
  })
})
