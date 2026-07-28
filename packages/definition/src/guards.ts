import { values } from 'lodash-es'

import type { CustomProp, CxComponentRuntime, CxComponentMetaDefined } from './types'

/**
 * 运行时类型守卫（纯叶模块：只依赖类型与 lodash-es）。
 * 抽离为独立叶子是为了解开 barrel 循环——这些守卫被 utils/tree/define/loader
 * 内部引用，若继续挂在 index.ts 桶文件上会形成 index→utils→index 运行时循环
 * （原作者已在 barrel 注释中踩过 TDZ 的坑）。
 *
 * 守卫参数统一用 unknown：守卫职责是"接收任意值、运行时判断形态"，
 * 函数体内通过 Record<string, unknown> 断言读取候选属性，比 any 更安全
 */

/** 把候选值断言为可属性访问的记录，用于守卫内读取候选字段 */
const asRecord = (x: unknown): Record<string, unknown> => x as Record<string, unknown>

export const isCustomType = (s: unknown): s is CustomProp => {
  return asRecord(s)?.type === 'custom' && Boolean(asRecord(s).component)
}
export const isCxComponent = (x: unknown): x is CxComponentRuntime => {
  return Boolean(asRecord(x)?.id && asRecord(x)?.key)
}
export const isCxComponentMeta = (x: unknown): x is CxComponentMetaDefined => {
  return Boolean(asRecord(x)?.key) && !isCxComponent(x)
}
export const isCxComponentGroup = (xs: unknown): xs is CxComponentRuntime[] => {
  return Array.isArray(xs) && xs.every((x: unknown) => isCxComponent(x))
}
export const isCxComponentGroups = (xss: unknown): xss is CxComponentRuntime[][] => {
  return Array.isArray(xss) && xss.every((x: unknown) => isCxComponentGroup(x))
}
export const isSlottedCxComponentGroup = (
  rs: unknown,
): rs is Record<string, CxComponentRuntime[]> => {
  if (Array.isArray(rs)) {
    return false
  }
  // values 需要 object 入参；rs 非 null 且非数组时按对象处理
  return Boolean(rs) && values(rs as Record<string, unknown>).every(isCxComponentGroup)
}
