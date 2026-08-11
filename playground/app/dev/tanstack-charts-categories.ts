import type { DevItem } from './material-utils'

// TanStack Charts 物料的分类装配。
// 与 vtu 对齐 histoire 官方清单的范式不同：TanStack Charts 是 mark 级底层库，无外部权威
// 「官方物料分类」可对齐——本文件即分类权威源，契约语义为「本清单 ↔ 包内物料 key 集」
// 两个独立维护点的一致性（单向完备）：物料增删不同步本清单时分类测试立刻暴露。

export type TscCategory = '通用' | '预设图表'

export const TSC_CATEGORY_ORDER: readonly TscCategory[] = ['通用', '预设图表'] as const

// 当前已实现的物料名清单（去 cx-tanstack-charts- 前缀，kebab）；
// 与包内物料 key 集双向相等（分类测试锁定），Slice 新增物料时同步扩充
export const TSC_FROZEN_KEYS = [
  // 通用
  'chart',
] as const

// cx 物料 key（cx-tanstack-charts-<名>）→ 分类。
// 先于物料实现建全映射：groupByCategory 只遍历已实现物料，未实现的映射不被命中，
// 故本表可一次性建全而不破坏增量验收；新增物料忘记映射时 groupByCategory 抛错暴露。
const CATEGORY_BY_KEY: Record<string, TscCategory> = {
  chart: '通用',
  line: '预设图表',
  bar: '预设图表',
  area: '预设图表',
  dot: '预设图表',
  pie: '预设图表',
}

/** 按分类分组装配 sidebar；物料 key 未映射时抛错强制补全 */
export function groupByCategory(items: DevItem[]): { name: TscCategory; items: DevItem[] }[] {
  const byCategory = new Map<TscCategory, DevItem[]>()
  for (const item of items) {
    const shortKey = item.meta.key.replace(/^cx-tanstack-charts-/, '')
    const category = CATEGORY_BY_KEY[shortKey]
    if (!category) {
      throw new Error(`tanstack-charts 物料未分类: ${item.meta.key}，请补 CATEGORY_BY_KEY 映射`)
    }
    const list = byCategory.get(category) ?? []
    list.push(item)
    byCategory.set(category, list)
  }
  return TSC_CATEGORY_ORDER.filter((name) => byCategory.has(name)).map((name) => ({
    name,
    items: byCategory.get(name)!,
  }))
}
