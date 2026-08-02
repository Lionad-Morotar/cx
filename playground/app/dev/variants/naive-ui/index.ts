import { containerVariants } from './container'
import { dataVariants } from './data'
import { feedbackVariants } from './feedback'
import { formVariants } from './form'
import { navigationVariants } from './navigation'
import { tableVariants } from './table'

import type { VariantRegistry } from '../../variants-utils'

// naive-ui variants 桶：按包冻结 6 分类分文件（与 naive-ui-categories 同构），
// 此处 spread 合并为单一 registry 供页面消费；分类文件独立演进互不冲突。
export const naiveUiVariants: VariantRegistry = {
  ...feedbackVariants,
  ...dataVariants,
  ...navigationVariants,
  ...formVariants,
  ...tableVariants,
  ...containerVariants,
}

export { containerVariants } from './container'
export { dataVariants } from './data'
export { feedbackVariants } from './feedback'
export { formVariants } from './form'
export { navigationVariants } from './navigation'
export { tableVariants } from './table'
