import CxNuxtUI from './nuxt-ui-2'
import CxSimpleCard from './simple-card'
import type { CxMaterialBundle } from '@lionad/cx-definition'

export { default as CxNuxtUI } from './nuxt-ui-2'
export { default as CxSimpleCard } from './simple-card'

/** nuxt-ui 物料 bundle：vendored Nuxt UI v2 物料自描述单元，供装配方（cx-nuxt 等）按 bundle 装配 */
export const CxNuxtUIBundle: CxMaterialBundle = {
  name: 'nuxt-ui',
  materials: [...CxNuxtUI, CxSimpleCard],
}
