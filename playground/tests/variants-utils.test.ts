import { describe, expect, it } from 'vitest'

import { variantsOf, variantDefsOf, type VariantRegistry } from '../app/dev/variants-utils'
import { buildDefaultData, type CxMeta } from '../app/dev/material-utils'

// variants 派生机制契约：未手写物料回落单个默认 variant；手写覆盖按注册表顺序并列派生节点。

const meta: CxMeta = {
  key: 'cx-fake-button',
  name: '假按钮',
  props: {
    label: { name: '文本', type: 'short', initial: '按钮' },
    variant: { name: '样式', type: 'select', initial: 'solid' },
  },
}

const registry: VariantRegistry = {
  'cx-fake-button': [
    { label: '默认' },
    { label: '主要', data: { variant: 'primary' } },
    { label: '禁用态', data: { variant: 'muted', label: '不可点击' } },
  ],
}

describe('variantDefsOf', () => {
  it('未注册物料回落单个默认 variant（label 非空且 ≠ 物料名）', () => {
    const defs = variantDefsOf({ ...meta, key: 'cx-unregistered' }, registry)
    expect(defs).toHaveLength(1)
    expect(defs[0]!.label).toBe('默认')
    expect(defs[0]!.label).not.toBe(meta.name)
  })

  it('已注册物料按注册表顺序返回全部定义', () => {
    const defs = variantDefsOf(meta, registry)
    expect(defs.map((d) => d.label)).toEqual(['默认', '主要', '禁用态'])
  })
})

describe('variantsOf', () => {
  it('默认 variant 节点 data = buildDefaultData，id 带 -v0 后缀', () => {
    const variants = variantsOf({ ...meta, key: 'cx-unregistered' }, registry)
    expect(variants).toHaveLength(1)
    expect(variants[0]!.node.data).toEqual(buildDefaultData(meta))
    expect(variants[0]!.node.id).toBe('dev-cx-unregistered-v0')
  })

  it('手写 variants 并列派生：块数 = 注册条目数，id 序号连续', () => {
    const variants = variantsOf(meta, registry)
    expect(variants).toHaveLength(3)
    expect(variants.map((v) => v.node.id)).toEqual([
      'dev-cx-fake-button-v0',
      'dev-cx-fake-button-v1',
      'dev-cx-fake-button-v2',
    ])
  })

  it('data 覆盖生效且 variant 间互不相等', () => {
    const variants = variantsOf(meta, registry)
    const datas = variants.map((v) => v.node.data as Record<string, unknown>)
    expect(datas[1]).toEqual({ label: '按钮', variant: 'primary' })
    expect(datas[2]).toEqual({ label: '不可点击', variant: 'muted' })
    expect(datas[0]).not.toEqual(datas[1])
    expect(datas[1]).not.toEqual(datas[2])
  })
})
