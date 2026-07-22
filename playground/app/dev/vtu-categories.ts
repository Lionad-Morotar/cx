import type { DevItem } from './material-utils'

// vtu（tool-ui-vue）物料的官方分类装配。
// 分类骨架以 vtu 的 histoire storyGroups 为准（6 分类 29 工具组件），与 vtu 组件故事站一致。

export type VtuCategory =
  | 'Data Display'
  | 'Code & Terminal'
  | 'Media'
  | 'Social'
  | 'Forms & Input'
  | 'Workflow'

export const VTU_CATEGORY_ORDER: readonly VtuCategory[] = [
  'Data Display',
  'Code & Terminal',
  'Media',
  'Social',
  'Forms & Input',
  'Workflow',
] as const

// vtu 官方 6 分类 29 工具组件清单（kebab，对齐 histoire storyGroups）；
// 官方新增组件会打破「清单 ↔ 物料 key 集」双向差集断言，评审后同步本清单与物料包
export const VTU_OFFICIAL_KEYS = [
  // Data Display
  'article',
  'chart',
  'data-table',
  'stats-display',
  'weather-widget',
  // Code & Terminal
  'code-block',
  'code-diff',
  'terminal',
  // Media
  'audio',
  'image',
  'image-gallery',
  'item-carousel',
  'video',
  // Social
  'approval-card',
  'citation',
  'contact-card',
  'instagram-post',
  'linkedin-post',
  'link-preview',
  'message-draft',
  'x-post',
  // Forms & Input
  'option-list',
  'parameter-slider',
  'preferences-panel',
  // Workflow
  'geo-map',
  'plan',
  'progress-tracker',
  'question-flow',
  'order-summary',
] as const

// cx 物料 key（cx-vtu-<官方名>）→ 官方分类。
// 先于物料实现建全 29 key 映射：groupByCategory 只遍历已实现物料，未实现的映射不被命中，
// 故本表可一次性建全而不破坏增量验收；新增物料忘记映射时 groupByCategory 抛错暴露。
const CATEGORY_BY_KEY: Record<string, VtuCategory> = {
  // Data Display
  'cx-vtu-article': 'Data Display',
  'cx-vtu-chart': 'Data Display',
  'cx-vtu-data-table': 'Data Display',
  'cx-vtu-stats-display': 'Data Display',
  'cx-vtu-weather-widget': 'Data Display',

  // Code & Terminal
  'cx-vtu-code-block': 'Code & Terminal',
  'cx-vtu-code-diff': 'Code & Terminal',
  'cx-vtu-terminal': 'Code & Terminal',

  // Media
  'cx-vtu-audio': 'Media',
  'cx-vtu-image': 'Media',
  'cx-vtu-image-gallery': 'Media',
  'cx-vtu-item-carousel': 'Media',
  'cx-vtu-video': 'Media',

  // Social
  'cx-vtu-approval-card': 'Social',
  'cx-vtu-citation': 'Social',
  'cx-vtu-contact-card': 'Social',
  'cx-vtu-instagram-post': 'Social',
  'cx-vtu-linkedin-post': 'Social',
  'cx-vtu-link-preview': 'Social',
  'cx-vtu-message-draft': 'Social',
  'cx-vtu-x-post': 'Social',

  // Forms & Input
  'cx-vtu-option-list': 'Forms & Input',
  'cx-vtu-parameter-slider': 'Forms & Input',
  'cx-vtu-preferences-panel': 'Forms & Input',

  // Workflow
  'cx-vtu-geo-map': 'Workflow',
  'cx-vtu-plan': 'Workflow',
  'cx-vtu-progress-tracker': 'Workflow',
  'cx-vtu-question-flow': 'Workflow',
  'cx-vtu-order-summary': 'Workflow',
}

export interface CategoryGroup {
  name: VtuCategory
  items: DevItem[]
}

/**
 * 按 vtu 官方分类把验收物料分成 6 组。
 * 任一物料 key 未在 CATEGORY_BY_KEY 映射时抛错——分类完备性的强制契约：
 * 物料包新增物料必须同步补映射，否则验收页与测试立刻暴露。
 */
export function groupByCategory(items: DevItem[]): CategoryGroup[] {
  const groups = VTU_CATEGORY_ORDER.map((name) => ({ name, items: [] as DevItem[] }))
  const idx = new Map(VTU_CATEGORY_ORDER.map((name, i) => [name, i]))
  for (const item of items) {
    const cat = CATEGORY_BY_KEY[item.meta.key]
    if (!cat) {
      throw new Error(`[dev] 未分类的 vtu 物料: ${item.meta.key}（请在 CATEGORY_BY_KEY 补映射）`)
    }
    groups[idx.get(cat)!]!.items.push(item)
  }
  return groups.filter((g) => g.items.length > 0)
}
