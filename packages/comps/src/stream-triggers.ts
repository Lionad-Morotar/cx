import { compileTrigger, createTriggerRegistry } from '@lionad/cx-stream'

import CxBasics from './basic'
import CxUserStyle from './user-style'

import type { CxSpec, StreamTriggerConfig, TriggerRegistry } from '@lionad/cx-stream'

/**
 * 内置物料流式增量配置：标量主体形态 9 件，数组增长型维持零判定。
 *
 * 形态判定（22 件逐件）：
 * - scalar 适用 9 件：文本/标题 7 件（cx-text、cx-header、cx-h1~h5，主体
 *   content 标量字符串）、cx-user-style（userStyle CSS 字符串，闭合才注入
 *   避免半截 CSS 破坏页面）、cx-figure（image 对象 + caption 标量，照
 *   vtu image 先例的短属性形态）
 * - 数组增长型零判定：容器 4 件（block/scrollbar/page/grid）增长的是槽内
 *   子组件（components 树）而非 data 数组；headless 逻辑物料 8 件无可见
 *   UI；calendar props 全部注释无 data
 *
 * 骨架裁决：9 件均不设 skeletonFields。这些物料包装层 defineProps 全部
 * 带默认值（content/userStyle/image 属可选字段），列入会让 _cx_streaming
 * 标记在完整帧终态常亮；figure 空 image 有 CxEmptyImage 天然空态、文本类
 * 空壳期渲染占位空格（displayText 兜底），短属性形态的收益即空壳早挂载
 * + 属性闭合揭示，与 vtu 短属性 7 件同款。
 *
 * fallback 从简：渲染链路不过 zod，防崩依据是模板无守卫直访链；comps
 * 物料 props 均有 defineProps 默认值兜底，fallback 只给主体字段空壳值
 * 作自描述（??= 语义，真实字段已传输则不覆盖）。
 *
 * key 取自物料 meta 原值（keyOf 查询，定义缺失即显式抛错，静默错配会让
 * trigger 永不命中）；9 件清单由 playground 判定测试双向锁定。
 */

const TEXT_KEYS = ['cx-text', 'cx-header', 'cx-h1', 'cx-h2', 'cx-h3', 'cx-h4', 'cx-h5'] as const

type Keyed = { _cx_meta: { key: string } }

function keyOf(materials: unknown, key: string): string {
  const list = (Array.isArray(materials) ? materials : [materials]) as Keyed[]
  const comp = list.find((c) => c._cx_meta?.key === key)
  if (!comp) throw new Error(`comps 物料定义缺失: ${key}`)
  return comp._cx_meta.key
}

const textConfig = (key: (typeof TEXT_KEYS)[number]): StreamTriggerConfig => ({
  key: keyOf(CxBasics, key),
  sections: [{ kind: 'scalar', fallbackData: { content: '' } }],
  frameStride: 10,
})

export const COMPONENTS_STREAM_TRIGGERS: StreamTriggerConfig[] = [
  ...TEXT_KEYS.map(textConfig),
  {
    key: keyOf([CxUserStyle], 'cx-user-style'),
    sections: [{ kind: 'scalar', fallbackData: { userStyle: '' } }],
    frameStride: 10,
  },
  {
    key: keyOf(CxBasics, 'cx-figure'),
    sections: [{ kind: 'scalar', fallbackData: { image: {} } }],
    frameStride: 10,
  },
]

/** 装配内置物料的 trigger 注册表：标量主体形态 9 件（size 恒 9） */
export function createComponentsTriggerRegistry(): TriggerRegistry<CxSpec> {
  const registry = createTriggerRegistry<CxSpec>()
  for (const config of COMPONENTS_STREAM_TRIGGERS) {
    registry.register(config.key, compileTrigger(config))
  }
  return registry
}
