import { createArrayTrigger, createTriggerRegistry } from '@lionad/cx-stream'

import dataTableConfig from './data-table/stream-trigger'

import type { ArrayTriggerConfig, CxSpec, TriggerRegistry } from '@lionad/cx-stream'

/**
 * Naive UI 数组增长型物料的流式增量配置。
 * 判定适用的仅 data-table 一件：行数据为典型流式增长数组。
 * 各配置随组件定义存放（见组件目录 stream-trigger.ts），key 取自物料
 * meta 原值（def._cx_meta.key）而非手写字面量，组件改 key 时配置自动跟随。
 *
 * 未收录物料判定为不适用：descriptions / steps / breadcrumb / timeline / collapse /
 * select / radio-group / checkbox-group 的数组 props 为编辑器整体配置的静态结构
 * （选项 / 条目 / 步骤 / 面板），不是流式增长主体；其余展示与录入物料以标量内容为主。
 * 与 vtu 14/29、EP 1/27 收录先例同一判定语义。
 */
export const NAIVE_UI_STREAM_TRIGGERS: ArrayTriggerConfig[] = [dataTableConfig]

/**
 * 装配 Naive UI 物料的 trigger 注册表；工厂创建，实例间互不污染。
 */
export function createNaiveUiTriggerRegistry(): TriggerRegistry<CxSpec> {
  const registry = createTriggerRegistry<CxSpec>()
  for (const config of NAIVE_UI_STREAM_TRIGGERS) {
    registry.register(config.key, createArrayTrigger(config))
  }
  return registry
}

/** 增量节点的主数组（面板计数展示用）；非数组增长型组件或数组缺席时返回 null */
export function mainArrayOf(node: {
  key: string
  data?: Record<string, unknown>
}): unknown[] | null {
  const config = NAIVE_UI_STREAM_TRIGGERS.find((c) => c.key === node.key)
  if (!config) return null
  const arr = node.data?.[config.arrayKey]
  return Array.isArray(arr) ? arr : null
}
