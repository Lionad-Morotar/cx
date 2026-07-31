import { compileTrigger, createTriggerRegistry } from '@lionad/cx-stream'

import chartConfig from './chart/stream-trigger'
import dataTableConfig from './data-table/stream-trigger'
import geoMapConfig from './geo-map/stream-trigger'
import imageGalleryConfig from './image-gallery/stream-trigger'
import itemCarouselConfig from './item-carousel/stream-trigger'
import optionListConfig from './option-list/stream-trigger'
import orderSummaryConfig from './order-summary/stream-trigger'
import parameterSliderConfig from './parameter-slider/stream-trigger'
import planConfig from './plan/stream-trigger'
import preferencesPanelConfig from './preferences-panel/stream-trigger'
import progressTrackerConfig from './progress-tracker/stream-trigger'
import questionFlowConfig from './question-flow/stream-trigger'
import statsDisplayConfig from './stats-display/stream-trigger'
import weatherWidgetConfig from './weather-widget/stream-trigger'

import type {
  ArraySectionConfig,
  CxSpec,
  StreamTriggerConfig,
  TriggerRegistry,
} from '@lionad/cx-stream'

/**
 * vtu 全部数组增长型物料的流式增量配置（29 件物料中判定适用的 14 件）。
 * 各配置随组件定义存放（见各组件目录 stream-trigger.ts），key 取自物料
 * meta 原值（def._cx_meta.key）而非手写字面量，组件改 key 时配置自动跟随。
 * 不用 component.key 派生值：它是 kebab/camel 往返的产物，数字段会被
 * lodash 拆词（v4 → v-4）而偏离 spec 契约 key；vtu 全字母 key 恰好往返
 * 不变，但那是巧合不是契约。
 *
 * 未收录的 15 件判定为不适用：社媒贴文（x/instagram/linkedin-post，贴文为
 * 单体对象）、article（正文标量 + 次要标签）、code-block/code-diff/terminal
 * （代码字符串为主体，高亮行为辅助元数据）、audio/image/video/citation/
 * contact-card/link-preview（标量内容）、message-draft（收件人为次要小数组，
 * 正文标量）、approval-card（metadata 为辅助对象）。
 */
export const VTU_STREAM_TRIGGERS: StreamTriggerConfig[] = [
  dataTableConfig,
  chartConfig,
  imageGalleryConfig,
  statsDisplayConfig,
  geoMapConfig,
  optionListConfig,
  itemCarouselConfig,
  orderSummaryConfig,
  progressTrackerConfig,
  planConfig,
  questionFlowConfig,
  preferencesPanelConfig,
  weatherWidgetConfig,
  parameterSliderConfig,
]

/**
 * 装配 vtu 物料的 trigger 注册表；工厂创建，实例间互不污染。
 * 十四类数组增长型物料全部注册：多围栏剧本下任一围栏流式时增量面板都能
 * 展示当前组件的增量状态，而非冻结在首个组件的 lastValid 帧。
 */
export function createVtuTriggerRegistry(): TriggerRegistry<CxSpec> {
  const registry = createTriggerRegistry<CxSpec>()
  for (const config of VTU_STREAM_TRIGGERS) {
    registry.register(config.key, compileTrigger(config))
  }
  return registry
}

/** 增量节点的主数组（面板计数展示用）；非数组增长型组件或数组缺席时返回 null */
export function mainArrayOf(node: {
  key: string
  data?: Record<string, unknown>
}): unknown[] | null {
  const config = VTU_STREAM_TRIGGERS.find((c) => c.key === node.key)
  const arraySection = config?.sections.find(
    (s): s is ArraySectionConfig => s.kind === 'array',
  )
  if (!arraySection) return null
  const arr = node.data?.[arraySection.arrayKey]
  return Array.isArray(arr) ? arr : null
}
