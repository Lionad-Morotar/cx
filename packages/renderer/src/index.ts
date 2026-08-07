import CxRender from './comps/render.vue'
import CxRenderComps from './comps/index'
import type { CxMaterialBundle } from '@lionad/cx-definition'
import './styles/index.scss'

export * from './event'
export * from './utils/hydrate'
export * from './utils/to-renderable'
export { default as CxRender } from './comps/render.vue'
export { default as CxRenderComps } from './comps/index'

/** render 物料 bundle：渲染器必需物料的自描述单元，供装配方（cx-nuxt 等）按 bundle 装配 */
export const CxRenderBundle: CxMaterialBundle = {
  name: 'render',
  materials: [...CxRenderComps],
}

export default CxRender
