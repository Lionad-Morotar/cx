import { describe, expect, it } from 'vitest'

import { CxNuxtUI, CxSimpleCard } from '@lionad/cx-components-nuxt-ui-v2'

import { toItem, type CxMeta } from '../app/dev/material-utils'
import { groupByCategory, NUTS_UI_V2_CATEGORY_ORDER } from '../app/dev/nuxt-ui-v2-categories'

// 验收页实际装配的物料集合（CxNuxtUI 数组 + CxSimpleCard）
const materials = [...CxNuxtUI, CxSimpleCard] as unknown as { _cx_meta: CxMeta }[]
const items = materials.map(toItem)

describe('Nuxt UI v2 物料分类', () => {
  it('全部物料均已归类（未映射会抛错）', () => {
    expect(() => groupByCategory(items)).not.toThrow()
  })

  it('恰好分 6 组，与官方分类数一致', () => {
    const groups = groupByCategory(items)
    expect(groups.map((g) => g.name)).toEqual([...NUTS_UI_V2_CATEGORY_ORDER])
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

  it('关键归属与 vendored 源码目录一致（抽样）', () => {
    const groups = groupByCategory(items)
    const find = (key: string) =>
      groups.find((g) => g.items.some((i) => i.meta.key === key))!.name

    // Elements
    expect(find('cx-button')).toBe('Elements')
    expect(find('cx-button-group')).toBe('Elements')
    expect(find('cx-meter-group')).toBe('Elements')
    // Form
    expect(find('cx-input')).toBe('Form')
    expect(find('cx-radio')).toBe('Form')
    // Data
    expect(find('cx-table')).toBe('Data')
    // Layout
    expect(find('cx-card')).toBe('Layout')
    expect(find('cx-simple-card')).toBe('Layout')
    // Navigation
    expect(find('cx-tabs')).toBe('Navigation')
    expect(find('cx-navigation')).toBe('Navigation')
    // Overlay
    expect(find('cx-modal')).toBe('Overlay')
    expect(find('cx-notification')).toBe('Overlay')
  })
})
