import { compileTrigger, createTriggerRegistry, fromArrayTriggerConfig } from '@lionad/cx-stream'

import alertConfig from './alert/stream-trigger'
import avatarConfig from './avatar/stream-trigger'
import breadcrumbConfig from './breadcrumb/stream-trigger'
import cardConfig from './card/stream-trigger'
import collapseConfig from './collapse/stream-trigger'
import dataTableConfig from './data-table/stream-trigger'
import descriptionsConfig from './descriptions/stream-trigger'
import emptyConfig from './empty/stream-trigger'
import resultConfig from './result/stream-trigger'
import statisticConfig from './statistic/stream-trigger'
import stepsConfig from './steps/stream-trigger'
import timelineConfig from './timeline/stream-trigger'

import type { CxSpec, StreamTriggerConfig, TriggerRegistry } from '@lionad/cx-stream'

/**
 * Naive UI 物料的流式增量配置（多形态 DSL 联合数组）。
 * key 取自物料 meta 原值（def._cx_meta.key）而非手写字面量，组件改 key 时配置自动跟随；
 * data-table 既有 ArrayTriggerConfig 声明经 fromArrayTriggerConfig 等价迁移融入（identity
 * 等价包装，声明文件逐位不动）。
 *
 * 判定表（27 件全量，逐件判据见 docs/dissections/260802-naive-ui-deepen.md）：
 *
 * array 6 件（内容条目数组逐项揭示）：
 * - data-table（data 行数组 + columns 次增长路径，既有）
 * - collapse / timeline / breadcrumb / descriptions（items 内容条目）
 * - steps（steps 步骤条目）
 *
 * scalar 5 件（答复内容标量，空壳早挂载 + 属性闭合揭示）：
 * - alert（title/content）、result（title/description）、empty（description）
 * - avatar（src，短属性 scalar 与 vtu image / nuiv4 avatar 先例同构）
 * - statistic（label/value，独立展示物料短属性 scalar，区别于 badge 依附宿主标记）
 *
 * region 1 件（内容槽区域渐次揭示）：card（default/header 双内容槽，
 * slots 取自物料 _cx_meta.slots keys，与 nuiv4 card 先例同构）
 *
 * 不适用 15 件：表单录入 9 件（input/input-number/switch/select/radio-group/
 * checkbox-group/date-picker/rate/slider，选项为控件候选值非内容条目）；button
 * （动作触发）；badge/tag（极短标记依附宿主或装饰）；progress（数值状态）；
 * divider（装饰排版）；space（布局容器，增长在槽内 components 树）。
 * 「静态配置数组不适用」判据仅对表单 options 族保留——内容条目数组经 nuiv4
 * 收录实践（accordion/stepper/timeline/breadcrumb，commit 5140382 起）证伪旧一刀切语义。
 */
export const NAIVE_UI_STREAM_TRIGGERS: StreamTriggerConfig[] = [
  collapseConfig,
  stepsConfig,
  timelineConfig,
  breadcrumbConfig,
  descriptionsConfig,
  fromArrayTriggerConfig(dataTableConfig),
  alertConfig,
  resultConfig,
  emptyConfig,
  avatarConfig,
  statisticConfig,
  cardConfig,
]

/**
 * 装配 Naive UI 物料的 trigger 注册表；工厂创建，实例间互不污染。
 * 多形态声明经 compileTrigger 统一编译（array/scalar/region 分流由各形态语义自理）。
 */
export function createNaiveUiTriggerRegistry(): TriggerRegistry<CxSpec> {
  const registry = createTriggerRegistry<CxSpec>()
  for (const config of NAIVE_UI_STREAM_TRIGGERS) {
    registry.register(config.key, compileTrigger(config))
  }
  return registry
}

/** 增量节点的主数组（面板计数展示用）；无 array 形态或数组缺席时返回 null */
export function mainArrayOf(node: {
  key: string
  data?: Record<string, unknown>
}): unknown[] | null {
  const config = NAIVE_UI_STREAM_TRIGGERS.find((c) => c.key === node.key)
  const arraySection = config?.sections.find((s) => s.kind === 'array')
  if (!arraySection) return null
  const arr = node.data?.[arraySection.arrayKey]
  return Array.isArray(arr) ? arr : null
}
