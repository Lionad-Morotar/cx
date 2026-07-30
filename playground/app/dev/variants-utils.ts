import { buildSampleNode, type CxMeta } from './material-utils'

import type { CxComponentRuntime } from '@lionad/cx-definition'

// dev 验收页 variants 机制：每个物料可有一组 variant 定义（label + data 覆盖），
// 未手写的物料回落单个默认 variant（data 取 props initial），保证 191 件物料
// 全量可展示而无需逐一手写——手写只覆盖需要多形态对照的重点物料。

export interface VariantDef {
  /** variant 块标题：描述该形态语义（如「主要按钮」「禁用态」），非空且应 ≠ 物料名 */
  label: string
  /** data 覆盖：浅合并于 props initial 之上（嵌套数组整替不深合） */
  data?: Record<string, unknown>
}

/** 物料 key → 手写 variant 定义；缺席或空数组者回落默认 variant */
export type VariantRegistry = Record<string, VariantDef[]>

export const DEFAULT_VARIANT_LABEL = '默认'

/** 物料的 variant 定义序列：手写优先，否则单个默认 variant */
export function variantDefsOf(meta: CxMeta, registry: VariantRegistry = {}): VariantDef[] {
  const defs = registry[meta.key]
  return defs?.length ? defs : [{ label: DEFAULT_VARIANT_LABEL }]
}

export interface VariantEntry {
  label: string
  node: CxComponentRuntime
}

/**
 * 物料的可渲染 variant 序列：每个定义派生一个独立节点（id 带 -v<index> 后缀，
 * 保证同物料多 variant 在 CxRender 中落在不同实例上并列渲染而非互相覆盖）。
 */
export function variantsOf(meta: CxMeta, registry: VariantRegistry = {}): VariantEntry[] {
  return variantDefsOf(meta, registry).map((def, index) => ({
    label: def.label,
    node: buildSampleNode(meta, {
      dataOverride: def.data,
      id: `dev-${meta.key}-v${index}`,
    }),
  }))
}
