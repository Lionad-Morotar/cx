import { values } from 'lodash-es'
import { isCxComponent, isCxComponentGroup, isCxComponentGroups } from '../guards'
import type { CxComponentRuntime } from '../types'

type Handler = (comp: CxComponentRuntime) => void

/**
 * 遍历运行时组件树
 * @example touch(comp, (comp) => console.log(comp))
 * @example touch(comp, 'slot-name', (comp) => console.log(comp))
 */
export const touch = (
  comps:
    | CxComponentRuntime
    | CxComponentRuntime[]
    | CxComponentRuntime[][]
    | Record<string, CxComponentRuntime[]>,
  // @types 从指定 slot 开始遍历 | comp 处理函数
  slotOrHandler: string | Handler,
  handler?: Handler,
) => {
  const slot = typeof slotOrHandler === 'string' ? slotOrHandler : undefined
  handler = typeof slotOrHandler === 'function' ? slotOrHandler : handler || (() => ({}))

  const flatted = (
    isCxComponent(comps)
      ? [comps]
      : isCxComponentGroups(comps)
        ? comps
        : isCxComponentGroup(comps)
          ? comps
          : values(comps).filter(isCxComponentGroup)
  ).flat(Number.POSITIVE_INFINITY) as CxComponentRuntime[]

  flatted.forEach((comp) => {
    handler(comp)
    if (comp?.components) {
      slot
        ? // slot 不会传递
          touch(comp.components[slot]!, handler)
        : touch(comp.components, handler)
    }
  })
}

export interface RecurItem {
  children?: RecurItem[]
}

export const walk = <T extends RecurItem>(items: T | T[], exec: (item: T) => void) => {
  const flatted = [items].flat(Number.POSITIVE_INFINITY) as T[]
  flatted.forEach((item) => {
    exec(item)
    if (item?.children?.length) {
      walk(item.children as T[], exec)
    }
  })
}
