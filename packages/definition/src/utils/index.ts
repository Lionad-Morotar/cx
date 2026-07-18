import {
  isCxComponent,
  isCxComponentGroup,
  isCxComponentGroups,
  isSlottedCxComponentGroup,
} from '../index'
import { createCxMetadataUtils } from './metadata'
import { createCxRuntimeUtils } from './runtime'
import type { CxLoaderInstance } from '../index'

export * from './datas'

/**
 * 工具函数工厂
 * @params cx，CxLoader实例，工具函数需要读取 CxLoader 的实例中的已安装组件的信息
 */
export const createCxUtils = (cx: CxLoaderInstance) => {
  const metadataUtils = createCxMetadataUtils(cx)
  const runtimeUtils = createCxRuntimeUtils(cx, metadataUtils)

  return {
    isCxComponent,
    isCxComponentGroup,
    isCxComponentGroups,
    isSlottedCxComponentGroup,
    ...metadataUtils,
    ...runtimeUtils,
  }
}

export type CxUtils = ReturnType<typeof createCxUtils>
export * from './tree'
export * from './empty-array'
export * from './guard'
