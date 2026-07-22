import type { DevItem } from './material-utils'

// Nuxt UI v4 物料的官方分类装配。
// 分类骨架与归属以官方组件文档为准（2026-07-22 抓取 ui.nuxt.com/docs/components），
// 核心 6 分类单数命名、Layout 为首——不沿用 v2 页的分类名与归属。

export type NuxtUIv4Category = 'Layout' | 'Element' | 'Form' | 'Data' | 'Navigation' | 'Overlay'

export const NUXT_UI_V4_CATEGORY_ORDER: readonly NuxtUIv4Category[] = [
  'Layout',
  'Element',
  'Form',
  'Data',
  'Navigation',
  'Overlay',
] as const

// 官方核心 6 分类 70 组件清单（kebab，2026-07-22 抓取）；
// 官方新增组件会打破"清单 ↔ 物料 key 集"双向差集断言，评审后同步本清单与物料包
export const NUXT_UI_V4_OFFICIAL_KEYS = [
  // Layout
  'app',
  'container',
  'error',
  'footer',
  'header',
  'main',
  'sidebar',
  'theme',
  // Element
  'alert',
  'avatar',
  'avatar-group',
  'badge',
  'banner',
  'button',
  'calendar',
  'card',
  'chip',
  'collapsible',
  'field-group',
  'icon',
  'kbd',
  'progress',
  'separator',
  'skeleton',
  // Form
  'checkbox',
  'checkbox-group',
  'color-picker',
  'file-upload',
  'form',
  'form-field',
  'input',
  'input-date',
  'input-menu',
  'input-number',
  'input-rating',
  'input-tags',
  'input-time',
  'listbox',
  'pin-input',
  'radio-group',
  'select',
  'select-menu',
  'slider',
  'switch',
  'textarea',
  // Data
  'accordion',
  'carousel',
  'empty',
  'marquee',
  'scroll-area',
  'table',
  'timeline',
  'tree',
  'user',
  // Navigation
  'breadcrumb',
  'command-palette',
  'footer-columns',
  'link',
  'navigation-menu',
  'pagination',
  'stepper',
  'tabs',
  // Overlay
  'context-menu',
  'drawer',
  'dropdown-menu',
  'modal',
  'popover',
  'slideover',
  'toast',
  'tooltip',
] as const

// cx 物料 key（cx-nuxt-ui-v4-<官方名>）→ 官方分类。
// 注意 v2→v4 归属变化：accordion/carousel 属 Data（v2 为 Elements），
// card/separator/skeleton 属 Element（v2 为 Layout），link 属 Navigation（v2 为 Elements）。
const CATEGORY_BY_KEY: Record<string, NuxtUIv4Category> = {
  // Layout
  'cx-nuxt-ui-v4-app': 'Layout',
  'cx-nuxt-ui-v4-container': 'Layout',
  'cx-nuxt-ui-v4-error': 'Layout',
  'cx-nuxt-ui-v4-footer': 'Layout',
  'cx-nuxt-ui-v4-header': 'Layout',
  'cx-nuxt-ui-v4-main': 'Layout',
  'cx-nuxt-ui-v4-sidebar': 'Layout',
  'cx-nuxt-ui-v4-theme': 'Layout',

  // Element
  'cx-nuxt-ui-v4-alert': 'Element',
  'cx-nuxt-ui-v4-avatar': 'Element',
  'cx-nuxt-ui-v4-avatar-group': 'Element',
  'cx-nuxt-ui-v4-badge': 'Element',
  'cx-nuxt-ui-v4-banner': 'Element',
  'cx-nuxt-ui-v4-button': 'Element',
  'cx-nuxt-ui-v4-calendar': 'Element',
  'cx-nuxt-ui-v4-card': 'Element',
  'cx-nuxt-ui-v4-chip': 'Element',
  'cx-nuxt-ui-v4-collapsible': 'Element',
  'cx-nuxt-ui-v4-field-group': 'Element',
  'cx-nuxt-ui-v4-icon': 'Element',
  'cx-nuxt-ui-v4-kbd': 'Element',
  'cx-nuxt-ui-v4-progress': 'Element',
  'cx-nuxt-ui-v4-separator': 'Element',
  'cx-nuxt-ui-v4-skeleton': 'Element',

  // Form
  'cx-nuxt-ui-v4-checkbox': 'Form',
  'cx-nuxt-ui-v4-checkbox-group': 'Form',
  'cx-nuxt-ui-v4-color-picker': 'Form',
  'cx-nuxt-ui-v4-file-upload': 'Form',
  'cx-nuxt-ui-v4-form': 'Form',
  'cx-nuxt-ui-v4-form-field': 'Form',
  'cx-nuxt-ui-v4-input': 'Form',
  'cx-nuxt-ui-v4-input-date': 'Form',
  'cx-nuxt-ui-v4-input-menu': 'Form',
  'cx-nuxt-ui-v4-input-number': 'Form',
  'cx-nuxt-ui-v4-input-rating': 'Form',
  'cx-nuxt-ui-v4-input-tags': 'Form',
  'cx-nuxt-ui-v4-input-time': 'Form',
  'cx-nuxt-ui-v4-listbox': 'Form',
  'cx-nuxt-ui-v4-pin-input': 'Form',
  'cx-nuxt-ui-v4-radio-group': 'Form',
  'cx-nuxt-ui-v4-select': 'Form',
  'cx-nuxt-ui-v4-select-menu': 'Form',
  'cx-nuxt-ui-v4-slider': 'Form',
  'cx-nuxt-ui-v4-switch': 'Form',
  'cx-nuxt-ui-v4-textarea': 'Form',

  // Data
  'cx-nuxt-ui-v4-accordion': 'Data',
  'cx-nuxt-ui-v4-carousel': 'Data',
  'cx-nuxt-ui-v4-empty': 'Data',
  'cx-nuxt-ui-v4-marquee': 'Data',
  'cx-nuxt-ui-v4-scroll-area': 'Data',
  'cx-nuxt-ui-v4-table': 'Data',
  'cx-nuxt-ui-v4-timeline': 'Data',
  'cx-nuxt-ui-v4-tree': 'Data',
  'cx-nuxt-ui-v4-user': 'Data',

  // Navigation
  'cx-nuxt-ui-v4-breadcrumb': 'Navigation',
  'cx-nuxt-ui-v4-command-palette': 'Navigation',
  'cx-nuxt-ui-v4-footer-columns': 'Navigation',
  'cx-nuxt-ui-v4-link': 'Navigation',
  'cx-nuxt-ui-v4-navigation-menu': 'Navigation',
  'cx-nuxt-ui-v4-pagination': 'Navigation',
  'cx-nuxt-ui-v4-stepper': 'Navigation',
  'cx-nuxt-ui-v4-tabs': 'Navigation',

  // Overlay
  'cx-nuxt-ui-v4-context-menu': 'Overlay',
  'cx-nuxt-ui-v4-drawer': 'Overlay',
  'cx-nuxt-ui-v4-dropdown-menu': 'Overlay',
  'cx-nuxt-ui-v4-modal': 'Overlay',
  'cx-nuxt-ui-v4-popover': 'Overlay',
  'cx-nuxt-ui-v4-slideover': 'Overlay',
  'cx-nuxt-ui-v4-toast': 'Overlay',
  'cx-nuxt-ui-v4-tooltip': 'Overlay',
}

export interface CategoryGroup {
  name: NuxtUIv4Category
  items: DevItem[]
}

/**
 * 按 Nuxt UI v4 官方分类把验收物料分成 6 组。
 * 任一物料 key 未在 CATEGORY_BY_KEY 映射时抛错——这是分类完备性的强制契约：
 * 物料包新增物料必须同步补映射，否则验收页与测试会立刻暴露。
 */
export function groupByCategory(items: DevItem[]): CategoryGroup[] {
  const groups = NUXT_UI_V4_CATEGORY_ORDER.map((name) => ({ name, items: [] as DevItem[] }))
  const idx = new Map(NUXT_UI_V4_CATEGORY_ORDER.map((name, i) => [name, i]))
  for (const item of items) {
    const cat = CATEGORY_BY_KEY[item.meta.key]
    if (!cat) {
      throw new Error(
        `[dev] 未分类的 Nuxt UI v4 物料: ${item.meta.key}（请在 CATEGORY_BY_KEY 补映射）`,
      )
    }
    groups[idx.get(cat)!]!.items.push(item)
  }
  return groups.filter((g) => g.items.length > 0)
}
