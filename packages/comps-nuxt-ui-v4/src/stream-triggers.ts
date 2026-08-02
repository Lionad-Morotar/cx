import { compileTrigger, createTriggerRegistry } from '@lionad/cx-stream'

import accordionConfig from './accordion/stream-trigger'
import alertConfig from './alert/stream-trigger'
import avatarConfig from './avatar/stream-trigger'
import bannerConfig from './banner/stream-trigger'
import breadcrumbConfig from './breadcrumb/stream-trigger'
import cardConfig from './card/stream-trigger'
import carouselConfig from './carousel/stream-trigger'
import emptyConfig from './empty/stream-trigger'
import errorConfig from './error/stream-trigger'
import footerConfig from './footer/stream-trigger'
import footerColumnsConfig from './footer-columns/stream-trigger'
import headerConfig from './header/stream-trigger'
import sidebarConfig from './sidebar/stream-trigger'
import stepperConfig from './stepper/stream-trigger'
import tableConfig from './table/stream-trigger'
import tabsConfig from './tabs/stream-trigger'
import timelineConfig from './timeline/stream-trigger'
import treeConfig from './tree/stream-trigger'
import userConfig from './user/stream-trigger'

import type {
  ArraySectionConfig,
  CxSpec,
  StreamTriggerConfig,
  TriggerRegistry,
} from '@lionad/cx-stream'

/**
 * nuxt-ui-v4 物料的流式增量配置（70 件物料中判定适用的 19 件，四形态）：
 * - 数组增长型 8 件：表格/时间线/树/步骤条/面包屑/轮播/折叠面板/标签页
 *   （答复内容型数组逐项渐进；table 叠加空态透传分支）
 * - 多区容器 4 件：卡片/页脚/页头/侧边栏（内容区域 slot 独立揭示）
 * - 组合形态 1 件：页脚列（columns 数组主切分 + left/right 区域揭示）
 * - 标量主体 6 件：警告提示/头像/公告条/空态/错误页/用户卡
 *   （答复内容型标量属性闭合即揭示、key 检出空壳挂载；全部不列
 *   skeletonFields、不做 wrapper 骨架——props 全可选列入即终态常亮，
 *   天然空态足够：UAlert/UBanner/UEmpty/UError 空内容渲组件外壳、
 *   UAvatar/UUser 头像源空渲 fallback 图标）
 * 各配置随组件定义存放（见各组件目录 stream-trigger.ts），key 取自物料
 * meta 原值（def._cx_meta.key）而非手写字面量，组件改 key 时配置自动跟随。
 * 不用 component.key 派生值：它是 kebab/camel 往返的产物，v4 键名中的
 * 数字段会被 lodash 拆词（cx-nuxt-ui-v4-table → cx-nuxt-ui-v-4-table），
 * 与 spec 契约 key（LLM 输出、装配注册用的 meta.key 原值）漂移。
 *
 * 未收录的判定为不适用（51 件，判据：物料本体是否为答复内容的独立载体）：
 * - 交互控件 23 件：Form 组 21 件 + calendar + button
 *   （选项/占位/动作触发非答复内容）
 * - 交互浮层 8 件：context-menu/drawer/dropdown-menu/modal/popover/
 *   slideover/toast/tooltip（瞬态浮层/程序化反馈）
 * - 导航 chrome 4 件：command-palette/link/navigation-menu/pagination
 *   （link 的 label 为极短标记类文本，与 badge/chip 同一排除判据）
 * - 宿主标记与装饰 6 件：badge/chip/icon/kbd/separator/skeleton
 *   （语义依附宿主或纯装饰，答复内容主体性弱）
 * - 数值状态 1 件：progress（value/max 数值字段无闭合揭示价值）
 * - 纯槽容器 7 件：app/container/main/theme/collapsible/field-group/
 *   scroll-area（增长在槽内 components 树而非 data）
 * - 展示容器 2 件：avatar-group/marquee（配置 props + 槽容器）
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
  alertConfig,
  avatarConfig,
  bannerConfig,
  emptyConfig,
  errorConfig,
  userConfig,
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
