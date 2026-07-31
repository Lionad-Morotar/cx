import { compileTrigger, createTriggerRegistry } from '@lionad/cx-stream'

import accordionConfig from './accordion/stream-trigger'
import breadcrumbConfig from './breadcrumb/stream-trigger'
import cardConfig from './card/stream-trigger'
import carouselConfig from './carousel/stream-trigger'
import footerConfig from './footer/stream-trigger'
import footerColumnsConfig from './footer-columns/stream-trigger'
import headerConfig from './header/stream-trigger'
import sidebarConfig from './sidebar/stream-trigger'
import stepperConfig from './stepper/stream-trigger'
import tableConfig from './table/stream-trigger'
import tabsConfig from './tabs/stream-trigger'
import timelineConfig from './timeline/stream-trigger'
import treeConfig from './tree/stream-trigger'

import type {
  ArraySectionConfig,
  CxSpec,
  StreamTriggerConfig,
  TriggerRegistry,
} from '@lionad/cx-stream'

/**
 * nuxt-ui-v4 物料的流式增量配置（70 件物料中判定适用的 13 件，三形态）：
 * - 数组增长型 8 件：表格/时间线/树/步骤条/面包屑/轮播/折叠面板/标签页
 *   （答复内容型数组逐项渐进；table 叠加空态透传分支）
 * - 多区容器 4 件：卡片/页脚/页头/侧边栏（内容区域 slot 独立揭示）
 * - 组合形态 1 件：页脚列（columns 数组主切分 + left/right 区域揭示）
 * 各配置随组件定义存放（见各组件目录 stream-trigger.ts），key 取自物料
 * meta 原值（def._cx_meta.key）而非手写字面量，组件改 key 时配置自动跟随。
 * 不用 component.key 派生值：它是 kebab/camel 往返的产物，v4 键名中的
 * 数字段会被 lodash 拆词（cx-nuxt-ui-v4-table → cx-nuxt-ui-v-4-table），
 * 与 spec 契约 key（LLM 输出、装配注册用的 meta.key 原值）漂移。
 *
 * 未收录的判定为不适用，三类：
 * - 有数组字段但属表单控件选项：checkbox-group / input-tags / listbox
 * - 有数组字段但属交互浮层 / 页面骨架：dropdown-menu / context-menu /
 *   command-palette / navigation-menu
 * - 其余 50 件为标量内容、槽容器或交互原件（button / input / modal 等）
 */
export const NUXT_UI_V4_STREAM_TRIGGERS: StreamTriggerConfig[] = [
  tableConfig,
  timelineConfig,
  treeConfig,
  stepperConfig,
  breadcrumbConfig,
  carouselConfig,
  accordionConfig,
  tabsConfig,
  cardConfig,
  footerConfig,
  headerConfig,
  sidebarConfig,
  footerColumnsConfig,
]

/**
 * 装配 nuxt-ui-v4 物料的 trigger 注册表；工厂创建，实例间互不污染。
 */
export function createNuxtUiV4TriggerRegistry(): TriggerRegistry<CxSpec> {
  const registry = createTriggerRegistry<CxSpec>()
  for (const config of NUXT_UI_V4_STREAM_TRIGGERS) {
    registry.register(config.key, compileTrigger(config))
  }
  return registry
}

/** 增量节点的主数组（面板计数展示用）；非数组增长型组件或数组缺席时返回 null */
export function mainArrayOf(node: {
  key: string
  data?: Record<string, unknown>
}): unknown[] | null {
  const config = NUXT_UI_V4_STREAM_TRIGGERS.find((c) => c.key === node.key)
  const arraySection = config?.sections.find(
    (s): s is ArraySectionConfig => s.kind === 'array',
  )
  if (!arraySection) return null
  const arr = node.data?.[arraySection.arrayKey]
  return Array.isArray(arr) ? arr : null
}
