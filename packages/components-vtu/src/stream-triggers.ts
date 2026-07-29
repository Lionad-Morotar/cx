import { createArrayTrigger, createTriggerRegistry } from '@lionad/cx-stream'

import chartConfig from './chart/stream-trigger'
import dataTableConfig from './data-table/stream-trigger'
import geoMapConfig from './geo-map/stream-trigger'
import imageGalleryConfig from './image-gallery/stream-trigger'
import optionListConfig from './option-list/stream-trigger'
import statsDisplayConfig from './stats-display/stream-trigger'

import type { ArrayTriggerConfig, CxSpec, TriggerRegistry } from '@lionad/cx-stream'

/**
 * vtu 全部数组增长型物料的流式增量配置。
 * 各配置随组件定义存放（见各组件目录 stream-trigger.ts），key 引用组件
 * define 导出而非手写字面量，组件改 key 时配置自动跟随。
 */
export const VTU_STREAM_TRIGGERS: ArrayTriggerConfig[] = [
  dataTableConfig,
  chartConfig,
  imageGalleryConfig,
  statsDisplayConfig,
  geoMapConfig,
  optionListConfig,
]

/**
 * 装配 vtu 物料的 trigger 注册表；工厂创建，实例间互不污染。
 * 六类数组增长型物料全部注册：多围栏剧本下任一围栏流式时增量面板都能
 * 展示当前组件的增量状态，而非冻结在首个组件的 lastValid 帧。
 */
export function createVtuTriggerRegistry(): TriggerRegistry<CxSpec> {
  const registry = createTriggerRegistry<CxSpec>()
  for (const config of VTU_STREAM_TRIGGERS) {
    registry.register(config.key, createArrayTrigger(config))
  }
  return registry
}

/** 增量节点的主数组（面板计数展示用）；非数组增长型组件或数组缺席时返回 null */
export function mainArrayOf(node: {
  key: string
  data?: Record<string, unknown>
}): unknown[] | null {
  const config = VTU_STREAM_TRIGGERS.find((c) => c.key === node.key)
  if (!config) return null
  const arr = node.data?.[config.arrayKey]
  return Array.isArray(arr) ? arr : null
}
