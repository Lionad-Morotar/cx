import { values } from 'lodash-es'

import type { CustomProp, CxComponentRuntime, CxComponentMetaDefined } from './types'

/**
 * 运行时类型守卫（纯叶模块：只依赖类型与 lodash-es）。
 * 抽离为独立叶子是为了解开 barrel 循环——这些守卫被 utils/tree/normalize/loader
 * 内部引用，若继续挂在 index.ts 桶文件上会形成 index→utils→index 运行时循环
 * （原作者已在 barrel 注释中踩过 TDZ 的坑）。
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
