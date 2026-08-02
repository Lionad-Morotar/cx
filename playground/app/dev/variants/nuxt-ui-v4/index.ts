import { dataVariants } from './data'
import { elementVariants } from './element'
import { formVariants } from './form'
import { layoutVariants } from './layout'
import { navigationVariants } from './navigation'
import { overlayVariants } from './overlay'

import type { VariantRegistry } from '../../variants-utils'

// nuxt-ui-v4 variants 桶：按官方 6 分类分文件（与 nuxt-ui-v4-categories 同构），
// 此处 spread 合并为单一 registry 供页面消费；分类文件独立演进互不冲突。
export const nuxtUiV4Variants: VariantRegistry = {
  ...layoutVariants,
  ...elementVariants,
  ...formVariants,
  ...dataVariants,
  ...navigationVariants,
  ...overlayVariants,
}

export { dataVariants } from './data'
export { elementVariants } from './element'
export { formVariants } from './form'
export { layoutVariants } from './layout'
export { navigationVariants } from './navigation'
export { overlayVariants } from './overlay'
