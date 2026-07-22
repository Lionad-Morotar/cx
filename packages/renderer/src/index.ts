import CxRender from './cmpts/render.vue'
import CxRenderCmpts from './cmpts/index'
import type { CxMaterialBundle } from '@lionad/cx-definition'
import './styles/index.scss'

export * from './event'
export { default as CxRender } from './cmpts/render.vue'
export { default as CxRenderCmpts } from './cmpts/index'

/** render 物料 bundle：渲染器必需物料的自描述单元，供装配方（cx-nuxt 等）按 bundle 装配 */
export const CxRenderBundle: CxMaterialBundle = {
  name: 'render',
  materials: [...CxRenderCmpts],
}

export default CxRender
