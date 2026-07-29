import { createArrayTrigger, createTriggerRegistry } from '@lionad/cx-stream'

import type { ArrayTriggerConfig, CxSpec, TriggerRegistry } from '@lionad/cx-stream'

/**
 * 内置物料流式增量配置：空集——22 件物料逐件判定均非数组增长型。
 *
 * 判定依据：
 * - 文本 / 标题 7 件（cx-text、cx-header、cx-h1~h5）：主体为标量 content
 * - cx-figure：单张图片标量
 * - 容器 4 件（cx-block、cx-scrollbar、cx-page、cx-grid）：增长的是槽内
 *   子组件（components 树）而非 data 数组，不属数组增长型增量语义
 * - headless 逻辑物料 8 件（cx-logic、cx-datas、cx-action、cx-toast、
 *   cx-state、cx-computed、cx-navigate、cx-skeleton）：无可见 UI
 * - cx-calendar：配置 props 全部注释，无 data
 * - cx-user-style：单条 CSS 字符串
 *
 * 保留空配置与工厂是为了三包消费侧接口对称（playground 各验收页统一
 * create*TriggerRegistry() 接线）；未来内置物料出现数组增长型时在此追加。
 */
export const COMPONENTS_STREAM_TRIGGERS: ArrayTriggerConfig[] = []

/** 装配内置物料的 trigger 注册表；当前判定下为空注册表（size 恒 0） */
export function createComponentsTriggerRegistry(): TriggerRegistry<CxSpec> {
  const registry = createTriggerRegistry<CxSpec>()
  for (const config of COMPONENTS_STREAM_TRIGGERS) {
    registry.register(config.key, createArrayTrigger(config))
  }
  return registry
}
