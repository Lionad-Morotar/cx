import type { DevItem } from './material-utils'

// Element Plus 物料的分类装配。
// 分类骨架以物料包 README「六类 27 件冻结」为准（基础反馈 / 数据展示 / 导航版式 / 表单 / 表格 / 插槽容器）——
// 这是包自身的冻结分类，非 Element Plus 官方文档侧栏分类（官方 5 类 78 件，含本包未收录的 overlay/服务类）。

export type EpCategory = '基础反馈' | '数据展示' | '导航版式' | '表单' | '表格' | '插槽容器'

export const EP_CATEGORY_ORDER: readonly EpCategory[] = [
  '基础反馈',
  '数据展示',
  '导航版式',
  '表单',
  '表格',
  '插槽容器',
] as const

// 包冻结的 27 件物料名（去 cx-element-plus- 前缀，kebab）；
// 物料包新增/删减会打破「清单 ↔ 物料 key 集」双向差集断言，评审后同步本清单与物料包
export const EP_FROZEN_KEYS = [
  // 基础反馈
  'button',
  'alert',
  'result',
  'empty',
  // 数据展示
  'avatar',
  'badge',
  'progress',
  'statistic',
  'descriptions',
  // 导航版式
  'link',
  'tag',
  'divider',
  'steps',
  'breadcrumb',
  'timeline',
  // 表单
  'input',
  'input-number',
  'select',
  'radio-group',
  'checkbox-group',
  'switch',
  'date-picker',
  'rate',
  'slider',
  // 表格
  'table',
  // 插槽容器
  'card',
  'space',
] as const

// cx 物料 key（cx-element-plus-<名>）→ 冻结分类。
// 先于物料实现建全 27 key 映射：groupByCategory 只遍历已实现物料，未实现的映射不被命中，
// 故本表可一次性建全而不破坏增量验收；新增物料忘记映射时 groupByCategory 抛错暴露。
const CATEGORY_BY_KEY: Record<string, EpCategory> = {
  // 基础反馈
  'cx-element-plus-button': '基础反馈',
  'cx-element-plus-alert': '基础反馈',
  'cx-element-plus-result': '基础反馈',
  'cx-element-plus-empty': '基础反馈',

  // 数据展示
  'cx-element-plus-avatar': '数据展示',
  'cx-element-plus-badge': '数据展示',
  'cx-element-plus-progress': '数据展示',
  'cx-element-plus-statistic': '数据展示',
  'cx-element-plus-descriptions': '数据展示',

  // 导航版式
  'cx-element-plus-link': '导航版式',
  'cx-element-plus-tag': '导航版式',
  'cx-element-plus-divider': '导航版式',
  'cx-element-plus-steps': '导航版式',
  'cx-element-plus-breadcrumb': '导航版式',
  'cx-element-plus-timeline': '导航版式',

  // 表单
  'cx-element-plus-input': '表单',
  'cx-element-plus-input-number': '表单',
  'cx-element-plus-select': '表单',
  'cx-element-plus-radio-group': '表单',
  'cx-element-plus-checkbox-group': '表单',
  'cx-element-plus-switch': '表单',
  'cx-element-plus-date-picker': '表单',
  'cx-element-plus-rate': '表单',
  'cx-element-plus-slider': '表单',

  // 表格
  'cx-element-plus-table': '表格',

  // 插槽容器
  'cx-element-plus-card': '插槽容器',
  'cx-element-plus-space': '插槽容器',
}

export interface CategoryGroup {
  name: EpCategory
  items: DevItem[]
}

/**
 * 按包冻结分类把验收物料分成 6 组。
 * 任一物料 key 未在 CATEGORY_BY_KEY 映射时抛错——分类完备性的强制契约：
 * 物料包新增物料必须同步补映射，否则验收页与测试立刻暴露。
 */
export function groupByCategory(items: DevItem[]): CategoryGroup[] {
  const groups = EP_CATEGORY_ORDER.map((name) => ({ name, items: [] as DevItem[] }))
  const idx = new Map(EP_CATEGORY_ORDER.map((name, i) => [name, i]))
  for (const item of items) {
    const cat = CATEGORY_BY_KEY[item.meta.key]
    if (!cat) {
      throw new Error(`[dev] 未分类的 element-plus 物料: ${item.meta.key}（请在 CATEGORY_BY_KEY 补映射）`)
    }
    groups[idx.get(cat)!]!.items.push(item)
  }
  return groups.filter((g) => g.items.length > 0)
}
