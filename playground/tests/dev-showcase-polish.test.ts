import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

// S5 收官契约（R1.3 卡片退役 / R1.5.4 导航无损 / R1.6.1 排版与占位）：
// 静态读源断言，不绑运行时页面模板，迁移/重排后仍可存续。

// 测试位于 playground/tests/，源文件相对该目录解析（import.meta.url 为 file:// URL 基）
const read = (p: string) => readFileSync(fileURLToPath(new URL(p, import.meta.url)), 'utf8')

const migratedPages = [
  '../app/pages/dev/components.vue',
  '../app/pages/dev/components-nuxt-ui-v2.vue',
  '../app/pages/dev/components-nuxt-ui-v4.vue',
  '../app/pages/dev/components-vtu.vue',
  '../app/pages/dev/components-element-plus.vue',
]

describe('R1.3 卡片阵列退役', () => {
  it('五个迁移页均无 class="grid" 卡片阵列残留', () => {
    for (const page of migratedPages) {
      const src = read(page)
      expect(src, page).not.toMatch(/class="grid"/)
      expect(src, page).toContain('DevShowcase')
    }
  })
})

describe('R1.5.4 导航与索引无损', () => {
  it('dev-pages-nav 含 5 物料页 + stream 共 6 条互链', () => {
    const src = read('../app/components/dev-pages-nav.vue')
    for (const to of [
      '/dev/components',
      '/dev/components-nuxt-ui-v2',
      '/dev/components-nuxt-ui-v4',
      '/dev/components-vtu',
      '/dev/components-element-plus',
      '/dev/stream',
    ]) {
      expect(src, to).toContain(to)
    }
  })

  it('/dev/index 入口卡含 5 物料页 + stream 共 6 条', () => {
    const src = read('../app/pages/dev/index.vue')
    for (const to of [
      '/dev/components',
      '/dev/components-nuxt-ui-v2',
      '/dev/components-nuxt-ui-v4',
      '/dev/components-vtu',
      '/dev/components-element-plus',
      '/dev/stream',
    ]) {
      expect(src, to).toContain(`to: '${to}'`)
    }
  })

  it('stream.vue 未被本改版触碰其展示逻辑（仅 dev-pages-nav 引入入口）', () => {
    // stream 页不在迁移集：其源码不应出现 showcase 装配（避免误改）
    const src = read('../app/pages/dev/stream.vue')
    expect(src).not.toContain('DevShowcase')
  })
})

describe('R1.6.1 排版层级与透明边框占位', () => {
  it('showcase 三级字号两两不等（group 标题 < item 名 < variant 标题）', () => {
    const css = read('../app/components/DevShowcase.vue')
    const pick = (cls: string) => {
      const block = css.match(new RegExp(`\\.${cls}\\s*\\{([^}]*)\\}`))?.[1] ?? ''
      const m = block.match(/font-size:\s*(\d+)px/)
      return m ? Number(m[1]) : NaN
    }
    const group = pick('group-title')
    const item = pick('item-name')
    const variant = pick('variant-label')
    expect([group, item, variant].every((n) => !Number.isNaN(n))).toBe(true)
    expect(new Set([group, item, variant]).size).toBe(3)
    expect(group).toBeLessThan(item)
    expect(item).toBeLessThan(variant)
  })

  it('sidebar-item 两态等宽：默认透明边框占位 + 选中仅换边框色', () => {
    const css = read('../app/components/DevShowcase.vue')
    const base = css.match(/\.sidebar-item\s*\{([^}]*)\}/)?.[1] ?? ''
    const active = css.match(/\.sidebar-item--active\s*\{([^}]*)\}/)?.[1] ?? ''
    expect(base).toMatch(/border:\s*1px solid transparent/)
    expect(active).toMatch(/border-color:\s*#2563eb/)
  })
})
