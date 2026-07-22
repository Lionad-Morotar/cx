import CxBasics from './basic'
import CxGrid from './grid'
import CxCalendar from './calendar'
import CxPage from './page'
import CxUserStyle from './user-style'
import type { CxMaterialBundle } from '@lionad/cx-definition'

export { default as CxBasics } from './basic'
export { default as CxGrid } from './grid'
export { default as CxCalendar } from './calendar'
export { default as CxPage } from './page'
export { default as CxUserStyle } from './user-style'

/** components 物料 bundle：基础物料自描述单元，供装配方（cx-nuxt 等）按 bundle 装配 */
export const CxComponentsBundle: CxMaterialBundle = {
  name: 'components',
  materials: [CxPage, CxGrid, CxCalendar, CxUserStyle, ...CxBasics],
}
