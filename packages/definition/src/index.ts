import { values } from 'lodash-es'

import * as _cxConfigs from './configs'
import * as _cxEvents from './events'
import * as _cxHelper from './helper'
import * as _cxNormalize from './normalize'
import * as _cxHooks from './hooks'
import * as _cxLoader from './loader'
import * as _cxUtils from './utils'

import type { CustomProp, CxComponentRuntime, CxComponentMetaDefined } from './types'

export * from './configs'
export * from './events'
export * from './helper'
export * from './normalize'
export * from './hooks'
export * from './loader'
export * from './utils'
export * from './types'

/**
 * isCxComponent 等函数如果放在 types 里导出而不是手动导出，
 * 外面就拿不到值... 很奇怪
 */
export const isCustomType = (s: any): s is CustomProp => {
  return s?.type === 'custom' && Boolean(s.component)
}
export const isCxComponent = (x: any): x is CxComponentRuntime => {
  return Boolean((x as any)?.id && (x as any)?.key)
}
export const isCxComponentMeta = (x: any): x is CxComponentMetaDefined => {
  return Boolean((x as any)?.key) && !isCxComponent(x)
}
export const isCxComponentGroup = (xs: any): xs is CxComponentRuntime[] => {
  return Array.isArray(xs) && xs.every((x: unknown) => isCxComponent(x))
}
export const isCxComponentGroups = (xss: any): xss is CxComponentRuntime[][] => {
  return Array.isArray(xss) && xss.every((x: unknown) => isCxComponentGroup(x))
}
export const isSlottedCxComponentGroup = (rs: any): rs is Record<string, CxComponentRuntime[]> => {
  if (Array.isArray(rs)) {
    return false
  }
  return rs && values(rs).every((group: unknown) => isCxComponentGroup(group))
}

export default {
  ..._cxConfigs,
  ..._cxEvents,
  ..._cxHelper,
  ..._cxNormalize,
  ..._cxHooks,
  ..._cxLoader,
  ..._cxUtils,
  isCustomType,
  isCxComponent,
  isCxComponentGroup,
  isCxComponentGroups,
  isSlottedCxComponentGroup,
}
