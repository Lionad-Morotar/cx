import { codeTerminalVariants } from './code-terminal'
import { dataDisplayVariants } from './data-display'
import { formsInputVariants } from './forms-input'
import { mediaVariants } from './media'
import { socialVariants } from './social'
import { workflowVariants } from './workflow'

import type { VariantRegistry } from '../../variants-utils'

// vtu variants 桶：按 vtu 官方 6 分类分文件（与 vtu-categories 同构），
// 此处 spread 合并为单一 registry 供页面消费；分类文件独立演进互不冲突。
export const vtuVariants: VariantRegistry = {
  ...dataDisplayVariants,
  ...codeTerminalVariants,
  ...mediaVariants,
  ...socialVariants,
  ...formsInputVariants,
  ...workflowVariants,
}

export { codeTerminalVariants } from './code-terminal'
export { dataDisplayVariants } from './data-display'
export { formsInputVariants } from './forms-input'
export { mediaVariants } from './media'
export { socialVariants } from './social'
export { workflowVariants } from './workflow'
