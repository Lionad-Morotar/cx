import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import {
  compsVariants,
  elementPlusVariants,
  naiveUiVariants,
  nuxtUiV2Variants,
  nuxtUiV4Variants,
  vtuVariants,
} from '../app/dev/variants'
import {
  codeTerminalVariants,
  dataDisplayVariants,
  formsInputVariants,
  mediaVariants,
  socialVariants,
  workflowVariants,
} from '../app/dev/variants/vtu'
import {
  dataVariants as v4DataVariants,
  elementVariants as v4ElementVariants,
  formVariants as v4FormVariants,
  layoutVariants as v4LayoutVariants,
  navigationVariants as v4NavigationVariants,
  overlayVariants as v4OverlayVariants,
} from '../app/dev/variants/nuxt-ui-v4'

import type { VariantRegistry } from '../app/dev/variants-utils'

// 手写 variants 内容契约（R1.4）：每个物料集至少 3 件物料具备 ≥2 个手写 variant，
// 且 label 非空——保证改版后的多形态对照不是空架子。

const multiVariantKeys = (registry: VariantRegistry) =>
  Object.entries(registry)
    .filter(([, defs]) => defs.length >= 2)
    .map(([key]) => key)

describe('comps 集手写 variants', () => {
  it('≥3 件物料有 ≥2 个 variant，label 均非空', () => {
    expect(multiVariantKeys(compsVariants).length).toBeGreaterThanOrEqual(3)
    for (const defs of Object.values(compsVariants)) {
      for (const def of defs) {
        expect(def.label.trim().length).toBeGreaterThan(0)
      }
    }
  })
})

describe('nuxt-ui-v4 集手写 variants', () => {
  it('≥3 件物料有 ≥2 个 variant，label 均非空', () => {
    expect(multiVariantKeys(nuxtUiV4Variants).length).toBeGreaterThanOrEqual(3)
    for (const defs of Object.values(nuxtUiV4Variants)) {
      for (const def of defs) {
        expect(def.label.trim().length).toBeGreaterThan(0)
      }
    }
  })
})

describe('nuxt-ui-v2 集手写 variants', () => {
  it('≥3 件物料有 ≥2 个 variant，label 均非空', () => {
    expect(multiVariantKeys(nuxtUiV2Variants).length).toBeGreaterThanOrEqual(3)
    for (const defs of Object.values(nuxtUiV2Variants)) {
      for (const def of defs) {
        expect(def.label.trim().length).toBeGreaterThan(0)
      }
    }
  })
})

describe('vtu 集手写 variants', () => {
  it('≥3 件物料有 ≥2 个 variant，label 均非空', () => {
    expect(multiVariantKeys(vtuVariants).length).toBeGreaterThanOrEqual(3)
    for (const defs of Object.values(vtuVariants)) {
      for (const def of defs) {
        expect(def.label.trim().length).toBeGreaterThan(0)
      }
    }
  })
})

describe('vtu variants 文件组织', () => {
  // 按 vtu 官方 6 分类拆分（与 vtu-categories 同构），桶文件 spread 合并；
  // 并集必须等于 vtuVariants 全部 key（防漏件），单文件受 FILE_LEN 约束
  const categoryModules = [
    ['data-display', dataDisplayVariants],
    ['code-terminal', codeTerminalVariants],
    ['media', mediaVariants],
    ['social', socialVariants],
    ['forms-input', formsInputVariants],
    ['workflow', workflowVariants],
  ] as const

  it('6 个分类文件并集 = vtuVariants 全部 key，无遗漏无冗余', () => {
    const merged: VariantRegistry = {}
    for (const [, registry] of categoryModules) {
      for (const key of Object.keys(registry)) {
        expect(merged[key], `${key} 在多个分类文件重复`).toBeUndefined()
        merged[key] = registry[key]!
      }
    }
    expect(Object.keys(merged).sort()).toEqual(Object.keys(vtuVariants).sort())
  })

  it('分类 key 与 vtu-categories 官方分组一致', () => {
    const categoryOf = {
      'data-display': ['article', 'chart', 'data-table', 'stats-display', 'weather-widget'],
      'code-terminal': ['code-block', 'code-diff', 'terminal'],
      media: ['audio', 'image', 'image-gallery', 'item-carousel', 'video'],
      social: [
        'approval-card',
        'citation',
        'contact-card',
        'instagram-post',
        'linkedin-post',
        'link-preview',
        'message-draft',
        'x-post',
      ],
      'forms-input': ['option-list', 'parameter-slider', 'preferences-panel'],
      workflow: ['geo-map', 'plan', 'progress-tracker', 'question-flow', 'order-summary'],
    } as const
    for (const [file, registry] of categoryModules) {
      for (const key of Object.keys(registry)) {
        const official = key.replace(/^cx-vtu-/, '')
        expect(
          (categoryOf[file as keyof typeof categoryOf] as readonly string[]).includes(official),
          `${key} 不属于 ${file} 分类`,
        ).toBe(true)
      }
    }
  })

  it('每个分类文件 ≤ 300 行（FILE_LEN 约束）', () => {
    // __dirname 基（同 mock-contract 惯例）：该 vitest 环境 import.meta.url 非 file scheme
    const dir = join(__dirname, '..', 'app', 'dev', 'variants', 'vtu')
    for (const [file] of categoryModules) {
      const lines = readFileSync(`${dir}/${file}.ts`, 'utf8').split('\n').length
      expect(lines, `${file}.ts 超 300 行`).toBeLessThanOrEqual(301)
    }
  })
})

describe('nuxt-ui-v4 variants 文件组织', () => {
  // 按官方 6 分类拆分（与 nuxt-ui-v4-categories 同构），桶文件 spread 合并；
  // 并集必须等于 nuxtUiV4Variants 全部 key（防漏件），单文件受 FILE_LEN 约束
  const categoryModules = [
    ['layout', v4LayoutVariants],
    ['element', v4ElementVariants],
    ['form', v4FormVariants],
    ['data', v4DataVariants],
    ['navigation', v4NavigationVariants],
    ['overlay', v4OverlayVariants],
  ] as const

  it('6 个分类文件并集 = nuxtUiV4Variants 全部 key，无遗漏无冗余', () => {
    const merged: VariantRegistry = {}
    for (const [, registry] of categoryModules) {
      for (const key of Object.keys(registry)) {
        expect(merged[key], `${key} 在多个分类文件重复`).toBeUndefined()
        merged[key] = registry[key]!
      }
    }
    expect(Object.keys(merged).sort()).toEqual(Object.keys(nuxtUiV4Variants).sort())
  })

  it('分类 key 与官方分组一致', () => {
    const categoryOf = {
      layout: ['app', 'container', 'error', 'footer', 'header', 'main', 'sidebar', 'theme'],
      element: [
        'alert', 'avatar', 'avatar-group', 'badge', 'banner', 'button', 'calendar',
        'card', 'chip', 'collapsible', 'field-group', 'icon', 'kbd', 'progress',
        'separator', 'skeleton',
      ],
      form: [
        'checkbox', 'checkbox-group', 'color-picker', 'file-upload', 'form',
        'form-field', 'input', 'input-date', 'input-menu', 'input-number',
        'input-rating', 'input-tags', 'input-time', 'listbox', 'pin-input',
        'radio-group', 'select', 'select-menu', 'slider', 'switch', 'textarea',
      ],
      data: ['accordion', 'carousel', 'empty', 'marquee', 'scroll-area', 'table', 'timeline', 'tree', 'user'],
      navigation: [
        'breadcrumb', 'command-palette', 'footer-columns', 'link', 'navigation-menu',
        'pagination', 'stepper', 'tabs',
      ],
      overlay: [
        'context-menu', 'drawer', 'dropdown-menu', 'modal', 'popover', 'slideover',
        'toast', 'tooltip',
      ],
    } as const
    for (const [file, registry] of categoryModules) {
      for (const key of Object.keys(registry)) {
        const official = key.replace(/^cx-nuxt-ui-v4-/, '')
        expect(
          (categoryOf[file as keyof typeof categoryOf] as readonly string[]).includes(official),
          `${key} 不属于 ${file} 分类`,
        ).toBe(true)
      }
    }
  })

  it('每个分类文件 ≤ 300 行（FILE_LEN 约束）', () => {
    const dir = join(__dirname, '..', 'app', 'dev', 'variants', 'nuxt-ui-v4')
    for (const [file] of categoryModules) {
      const lines = readFileSync(`${dir}/${file}.ts`, 'utf8').split('\n').length
      expect(lines, `${file}.ts 超 300 行`).toBeLessThanOrEqual(301)
    }
  })
})

describe('element-plus 集手写 variants', () => {
  it('≥3 件物料有 ≥2 个 variant，label 均非空', () => {
    expect(multiVariantKeys(elementPlusVariants).length).toBeGreaterThanOrEqual(3)
    for (const defs of Object.values(elementPlusVariants)) {
      for (const def of defs) {
        expect(def.label.trim().length).toBeGreaterThan(0)
      }
    }
  })
})

describe('naive-ui 集手写 variants', () => {
  it('≥3 件物料有 ≥2 个 variant，label 均非空', () => {
    expect(multiVariantKeys(naiveUiVariants).length).toBeGreaterThanOrEqual(3)
    for (const defs of Object.values(naiveUiVariants)) {
      for (const def of defs) {
        expect(def.label.trim().length).toBeGreaterThan(0)
      }
    }
  })
})
