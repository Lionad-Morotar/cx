import { describe, expect, it } from 'vitest'

import {
  compsVariants,
  elementPlusVariants,
  naiveUiVariants,
  nuxtUiV2Variants,
  nuxtUiV4Variants,
  vtuVariants,
} from '../app/dev/variants'

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
