import type { DevItem } from './material-utils'

// Nuxt UI v2 物料的官方分类装配。
// 分类骨架来自 vendored 源码 packages/components-nuxt-ui-v2/vendor/src/runtime/components/
// 下的 6 大目录（data / elements / forms / layout / navigation / overlays），
// 命名采用用户引用的 v4 文档习惯（overlays → Overlay）。

export type NuxtUIv2Category = 'Elements' | 'Form' | 'Data' | 'Layout' | 'Navigation' | 'Overlay'

export const NUTS_UI_V2_CATEGORY_ORDER: readonly NuxtUIv2Category[] = [
  'Elements',
  'Form',
  'Data',
  'Layout',
  'Navigation',
  'Overlay',
] as const

// cx 物料 key → 官方分类。归属以 vendored 源码目录为准；
// date-picker 虽依赖 v-calendar 而非 vendor/bridge，但语义属表单输入，归 Form。
const CATEGORY_BY_KEY: Record<string, NuxtUIv2Category> = {
  // Elements
  'cx-accordion': 'Elements',
  'cx-alert': 'Elements',
  'cx-avatar': 'Elements',
  'cx-badge': 'Elements',
  'cx-button': 'Elements',
  'cx-button-group': 'Elements',
  'cx-carousel': 'Elements',
  'cx-chip': 'Elements',
  'cx-dropdown': 'Elements',
  'cx-icon': 'Elements',
  'cx-kbd': 'Elements',
  'cx-link': 'Elements',
  'cx-meter': 'Elements',
  'cx-meter-group': 'Elements',
  'cx-progress': 'Elements',

  // Form
  'cx-checkbox': 'Form',
  'cx-date-picker': 'Form',
  'cx-form': 'Form',
  'cx-form-item': 'Form',
  'cx-input': 'Form',
  'cx-input-menu': 'Form',
  'cx-radio': 'Form',
  'cx-range': 'Form',
  'cx-select': 'Form',
  'cx-select-menu': 'Form',
  'cx-textarea': 'Form',
  'cx-toggle': 'Form',

  // Data
  'cx-table': 'Data',

  // Layout
  'cx-card': 'Layout',
  'cx-container': 'Layout',
  'cx-divider': 'Layout',
  'cx-skeleton': 'Layout',

  // Navigation
  'cx-breadcrumb': 'Navigation',
  'cx-command-palette': 'Navigation',
  'cx-navigation': 'Navigation',
  'cx-pagination': 'Navigation',
  'cx-tabs': 'Navigation',

  // Overlay
  'cx-context-menu': 'Overlay',
  'cx-modal': 'Overlay',
  'cx-notification': 'Overlay',
  'cx-popover': 'Overlay',
  'cx-slideover': 'Overlay',
  'cx-tooltip': 'Overlay',
}

export interface CategoryGroup {
  name: NuxtUIv2Category
  items: DevItem[]
}

/**
 * 按 Nuxt UI v2 官方分类把验收物料分成 6 组。
 * 任一物料 key 未在 CATEGORY_BY_KEY 映射时抛错——这是分类完备性的强制契约：
 * 物料包新增物料必须同步补映射，否则验收页与测试会立刻暴露。
 */
export function groupByCategory(items: DevItem[]): CategoryGroup[] {
  const groups = NUTS_UI_V2_CATEGORY_ORDER.map((name) => ({ name, items: [] as DevItem[] }))
  const idx = new Map(NUTS_UI_V2_CATEGORY_ORDER.map((name, i) => [name, i]))
  for (const item of items) {
    const cat = CATEGORY_BY_KEY[item.meta.key]
    if (!cat) {
      throw new Error(
        `[dev] 未分类的 Nuxt UI v2 物料: ${item.meta.key}（请在 CATEGORY_BY_KEY 补映射）`,
      )
    }
    groups[idx.get(cat)!]!.items.push(item)
  }
  return groups.filter((g) => g.items.length > 0)
}
