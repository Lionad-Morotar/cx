import type { DevItem } from './material-utils'

// Naive UI 物料的分类装配。
// 分类骨架以物料包 README「六类 27 件冻结」为准（基础反馈 / 数据展示 / 导航版式 / 表单 / 表格 / 插槽容器）——
// 这是包自身的冻结分类，非 Naive UI 官方文档侧栏分类（官方 5 类约 90 件，含本包未收录的 overlay/服务/重组件）。

export type NaiveUiCategory = '基础反馈' | '数据展示' | '导航版式' | '表单' | '表格' | '插槽容器'

export const NAIVE_UI_CATEGORY_ORDER: readonly NaiveUiCategory[] = [
  '基础反馈',
  '数据展示',
  '导航版式',
  '表单',
  '表格',
  '插槽容器',
] as const

// 包冻结的 27 件物料名（去 cx-naive-ui- 前缀，kebab）；
// 物料包新增/删减会打破「清单 ↔ 物料 key 集」双向差集断言，评审后同步本清单与物料包
export const NAIVE_UI_FROZEN_KEYS = [
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
  'collapse',
  // 导航版式
  'tag',
  'divider',
  'steps',
  'breadcrumb',
  'timeline',
  // 表单
  'input',
  'input-number',
  'switch',
  'select',
  'radio-group',
  'checkbox-group',
  'date-picker',
  'rate',
  'slider',
  // 表格
  'data-table',
  // 插槽容器
  'card',
  'space',
] as const

// cx 物料 key（cx-naive-ui-<名>）→ 冻结分类。
// 先于物料实现建全 27 key 映射：groupByCategory 只遍历已实现物料，未实现的映射不被命中，
// 故本表可一次性建全而不破坏增量验收；新增物料忘记映射时 groupByCategory 抛错暴露。
const CATEGORY_BY_KEY: Record<string, NaiveUiCategory> = {
  // 基础反馈
  'cx-naive-ui-button': '基础反馈',
  'cx-naive-ui-alert': '基础反馈',
  'cx-naive-ui-result': '基础反馈',
  'cx-naive-ui-empty': '基础反馈',

  // 数据展示
  'cx-naive-ui-avatar': '数据展示',
  'cx-naive-ui-badge': '数据展示',
  'cx-naive-ui-progress': '数据展示',
  'cx-naive-ui-statistic': '数据展示',
  'cx-naive-ui-descriptions': '数据展示',
  'cx-naive-ui-collapse': '数据展示',

  // 导航版式
  'cx-naive-ui-tag': '导航版式',
  'cx-naive-ui-divider': '导航版式',
  'cx-naive-ui-steps': '导航版式',
  'cx-naive-ui-breadcrumb': '导航版式',
  'cx-naive-ui-timeline': '导航版式',

  // 表单
  'cx-naive-ui-input': '表单',
  'cx-naive-ui-input-number': '表单',
  'cx-naive-ui-switch': '表单',
  'cx-naive-ui-select': '表单',
  'cx-naive-ui-radio-group': '表单',
  'cx-naive-ui-checkbox-group': '表单',
  'cx-naive-ui-date-picker': '表单',
  'cx-naive-ui-rate': '表单',
  'cx-naive-ui-slider': '表单',

  // 表格
  'cx-naive-ui-data-table': '表格',

  // 插槽容器
  'cx-naive-ui-card': '插槽容器',
  'cx-naive-ui-space': '插槽容器',
}

export interface CategoryGroup {
  name: NaiveUiCategory
  items: DevItem[]
}

/**
 * 按包冻结分类把验收物料分成 6 组。
 * 任一物料 key 未在 CATEGORY_BY_KEY 映射时抛错——分类完备性的强制契约：
 * 物料包新增物料必须同步补映射，否则验收页与测试立刻暴露。
 */
export function groupByCategory(items: DevItem[]): CategoryGroup[] {
  const groups = NAIVE_UI_CATEGORY_ORDER.map((name) => ({ name, items: [] as DevItem[] }))
  const idx = new Map(NAIVE_UI_CATEGORY_ORDER.map((name, i) => [name, i]))
  for (const item of items) {
    const cat = CATEGORY_BY_KEY[item.meta.key]
    if (!cat) {
      throw new Error(`[dev] 未分类的 naive-ui 物料: ${item.meta.key}（请在 CATEGORY_BY_KEY 补映射）`)
    }
    groups[idx.get(cat)!]!.items.push(item)
  }
  return groups.filter((g) => g.items.length > 0)
}
