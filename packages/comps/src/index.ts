import CxBasics from './basic'
import CxGrid from './grid'
import CxCalendar from './calendar'
import CxPage from './page'
import CxTabs from './tabs'
import CxUserStyle from './user-style'
import type { CxMaterialBundle } from '@lionad/cx-definition'

export { default as CxBasics } from './basic'
export { default as CxGrid } from './grid'
export { default as CxCalendar } from './calendar'
export { default as CxPage } from './page'
export { default as CxTabs } from './tabs'
export { default as CxUserStyle } from './user-style'

/** components 物料 bundle：基础物料自描述单元，供装配方（cx-nuxt 等）按 bundle 装配 */
export const CxComponentsBundle: CxMaterialBundle = {
  name: 'components',
  materials: [CxPage, CxGrid, CxCalendar, CxTabs, CxUserStyle, ...CxBasics],
}

// --- 流式增量渲染预设 ---
export * from './stream-triggers'

// --- 共享组件（非物料：物料组装侧直接消费的包装组件） ---
export * from './shared'
