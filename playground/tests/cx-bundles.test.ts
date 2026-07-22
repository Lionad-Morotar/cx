import { describe, expect, it, vi } from 'vitest'

// 装配链路 smoke：虚拟模块生成物（.nuxt/cx-bundles.mjs）与 installCxBundles 的真实遍历。
// 前置：playground 需先 nuxi prepare 生成 .nuxt（dev / typecheck 的标准前置步骤）。
import { cxBundles } from '../.nuxt/cx-bundles.mjs'
import { installCxBundles } from '../../packages/nuxt/src/runtime/install'

describe('物料 bundle 装配链路', () => {
  // 断言与 playground 的 materials 裁剪配置无关：开发者按插件化能力裁剪局部开发时，
  // 本测试仍须通过——只验证"启用集的自描述完备性与装配遍历正确性"，不钉死启用集本身
  it('虚拟模块的每个启用 bundle 自描述完备', () => {
    expect(cxBundles.length).toBeGreaterThan(0)
    for (const bundle of cxBundles as any[]) {
      expect(typeof bundle.name).toBe('string')
      expect(bundle.materials.length).toBeGreaterThan(0)
      for (const cmpt of bundle.materials) {
        expect(cmpt._cx_meta?.key).toMatch(/^cx-[a-z0-9-]+$/)
        expect(typeof cmpt._cx_install).toBe('function')
      }
    }
  })

  it('installCxBundles 真实遍历注册全部启用物料：type 置为 local，重复 key 不超已知历史集', async () => {
    const installComponent = vi.fn()
    await installCxBundles({ installComponent } as any, {} as any)

    const total = (cxBundles as any[]).reduce((n, b) => n + b.materials.length, 0)
    expect(installComponent).toHaveBeenCalledTimes(total)

    // 已知历史重复：基础物料与 v2 物料各有 cx-skeleton，v2 后注册覆盖基础物料
    // （原硬编码装配顺序相同，行为未变）；命名空间治理属后续专项。
    // 子集断言：裁剪配置下重复可不出现（如未启用 v2），但任何新重复都会打破断言
    const KNOWN_DUPLICATE_KEYS = ['cx-skeleton']
    const keys = installComponent.mock.calls.map(([key]) => key)
    const duplicates = [...new Set(keys.filter((k, i) => keys.indexOf(k) !== i))]
    expect(duplicates.every((k) => KNOWN_DUPLICATE_KEYS.includes(k))).toBe(true)

    for (const bundle of cxBundles as any[]) {
      for (const cmpt of bundle.materials) {
        expect(cmpt._cx_meta.type).toBe('local')
      }
    }
  })
})
