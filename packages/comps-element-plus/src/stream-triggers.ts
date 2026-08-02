import { compileTrigger, createTriggerRegistry } from '@lionad/cx-stream'

import alertConfig from './alert/stream-trigger'
import avatarConfig from './avatar/stream-trigger'
import breadcrumbConfig from './breadcrumb/stream-trigger'
import cardConfig from './card/stream-trigger'
import descriptionsConfig from './descriptions/stream-trigger'
import emptyConfig from './empty/stream-trigger'
import resultConfig from './result/stream-trigger'
import stepsConfig from './steps/stream-trigger'
import tableConfig from './table/stream-trigger'
import timelineConfig from './timeline/stream-trigger'

import type { CxSpec, StreamTriggerConfig, TriggerRegistry } from '@lionad/cx-stream'

/**
 * Element Plus 物料的流式增量配置（27 件物料中判定适用的 10 件，三形态）：
 * - 数组增长型 5 件：表格/时间线/步骤条/面包屑/描述列表
 *   （答复内容型数组逐项渐进；table 叠加列定义次增长路径）
 * - 多区容器 1 件：卡片（default/header 内容区域 slot 独立揭示）
 * - 标量主体 4 件：警告提示/结果页/空态/头像
 *   （答复内容型标量属性闭合即揭示、key 检出空壳挂载；全部不列
 *   skeletonFields、不做 wrapper 骨架——props 全可选列入即终态常亮，
 *   天然空态足够：ElAlert/ElResult/ElEmpty 空文本渲组件外壳、
 *   ElAvatar 空 src 渲 fallback 图标）
 * 各配置随组件定义存放（见各组件目录 stream-trigger.ts），key 取自物料
 * meta 原值（def._cx_meta.key）而非手写字面量，组件改 key 时配置自动跟随。
 *
 * 未收录的判定为不适用（17 件，判据：物料本体是否为答复内容的独立载体）：
 * - 交互控件 10 件：button + Form 组 9 件（input/input-number/select/
 *   radio-group/checkbox-group/switch/date-picker/rate/slider）
 *   （选项/占位/动作触发非答复内容）
 * - 极短标记 3 件：link/divider/tag（1-3 词 label 主体性弱、闭合揭示价值≈0）
 * - 宿主标记 1 件：badge（语义依附宿主元素，value 为数值）
 * - 数值状态 2 件：progress/statistic（数值字段无闭合揭示价值）
 * - 单槽布局壳 1 件：space（ElSpace 间距排版工具，布局 chrome 非答复内容
 *   载体——与 card 的分界是多内容区语义 vs 单槽布局壳）
 */
export const EP_STREAM_TRIGGERS: StreamTriggerConfig[] = [
  alertConfig,
  avatarConfig,
  breadcrumbConfig,
  cardConfig,
  descriptionsConfig,
  emptyConfig,
  resultConfig,
  stepsConfig,
  tableConfig,
  timelineConfig,
]

/**
 * 装配 Element Plus 物料的 trigger 注册表；工厂创建，实例间互不污染。
 */
export function createEpTriggerRegistry(): TriggerRegistry<CxSpec> {
  const registry = createTriggerRegistry<CxSpec>()
  for (const config of EP_STREAM_TRIGGERS) {
    registry.register(config.key, compileTrigger(config))
  }
  return registry
}

/** 增量节点的主数组（面板计数展示用）；非数组增长型组件或数组缺席时返回 null */
export function mainArrayOf(node: {
  key: string
  data?: Record<string, unknown>
}): unknown[] | null {
  const config = EP_STREAM_TRIGGERS.find((c) => c.key === node.key)
  const section = config?.sections.find((s) => s.kind === 'array')
  if (!section || section.kind !== 'array') return null
  const arr = node.data?.[section.arrayKey]
  return Array.isArray(arr) ? arr : null
}
