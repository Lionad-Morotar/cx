import { compileTrigger, createTriggerRegistry } from '@lionad/cx-stream'

import articleConfig from './article/stream-trigger'
import audioConfig from './audio/stream-trigger'
import approvalCardConfig from './approval-card/stream-trigger'
import chartConfig from './chart/stream-trigger'
import citationConfig from './citation/stream-trigger'
import codeBlockConfig from './code-block/stream-trigger'
import codeDiffConfig from './code-diff/stream-trigger'
import contactCardConfig from './contact-card/stream-trigger'
import dataTableConfig from './data-table/stream-trigger'
import geoMapConfig from './geo-map/stream-trigger'
import imageConfig from './image/stream-trigger'
import imageGalleryConfig from './image-gallery/stream-trigger'
import instagramPostConfig from './instagram-post/stream-trigger'
import itemCarouselConfig from './item-carousel/stream-trigger'
import linkPreviewConfig from './link-preview/stream-trigger'
import linkedinPostConfig from './linkedin-post/stream-trigger'
import messageDraftConfig from './message-draft/stream-trigger'
import optionListConfig from './option-list/stream-trigger'
import orderSummaryConfig from './order-summary/stream-trigger'
import parameterSliderConfig from './parameter-slider/stream-trigger'
import planConfig from './plan/stream-trigger'
import preferencesPanelConfig from './preferences-panel/stream-trigger'
import progressTrackerConfig from './progress-tracker/stream-trigger'
import questionFlowConfig from './question-flow/stream-trigger'
import statsDisplayConfig from './stats-display/stream-trigger'
import terminalConfig from './terminal/stream-trigger'
import videoConfig from './video/stream-trigger'
import weatherWidgetConfig from './weather-widget/stream-trigger'
import xPostConfig from './x-post/stream-trigger'

import type {
  ArraySectionConfig,
  CxSpec,
  StreamTriggerConfig,
  TriggerRegistry,
} from '@lionad/cx-stream'

/**
 * vtu 全部 29 件物料的流式增量配置（判定全适用，两种形态）：
 * - 数组增长型 14 件：主数组逐项切分（chart/data-table/image-gallery 等）
 * - 标量主体形态 15 件：属性闭合事件切分 + key 检出空壳挂载。article 为
 *   首例；长主体 7 件（社媒贴文/代码三件/message-draft）带骨架占位，
 *   短属性 7 件（媒体/引用/联系卡/链接预览/审批卡）纯属性揭示。
 * 各配置随组件定义存放（见各组件目录 stream-trigger.ts），key 取自物料
 * meta 原值（def._cx_meta.key）而非手写字面量，组件改 key 时配置自动跟随。
 * 不用 component.key 派生值：它是 kebab/camel 往返的产物，数字段会被
 * lodash 拆词（v4 → v-4）而偏离 spec 契约 key；vtu 全字母 key 恰好往返
 * 不变，但那是巧合不是契约。
 */
export const VTU_STREAM_TRIGGERS: StreamTriggerConfig[] = [
  articleConfig,
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
  xPostConfig,
  instagramPostConfig,
  linkedinPostConfig,
  codeBlockConfig,
  codeDiffConfig,
  terminalConfig,
  messageDraftConfig,
  audioConfig,
  imageConfig,
  videoConfig,
  citationConfig,
  contactCardConfig,
  linkPreviewConfig,
  approvalCardConfig,
]

/**
 * 装配 vtu 物料的 trigger 注册表；工厂创建，实例间互不污染。
 * 29 件物料全部注册：多围栏剧本下任一围栏流式时增量面板都能
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
