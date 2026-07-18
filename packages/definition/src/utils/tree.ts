import { values } from 'lodash-es'
import { isCxComponent, isCxComponentGroup, isCxComponentGroups } from '../index'
import type { CxComponentRuntime } from '../index'

type Handler = (cmpt: CxComponentRuntime) => void

/**
 * 遍历运行时组件树
 * @example touch(cmpt, (cmpt) => console.log(cmpt))
 * @example touch(cmpt, 'slot-name', (cmpt) => console.log(cmpt))
 */
export const touch = (
  cmpts:
    | CxComponentRuntime
    | CxComponentRuntime[]
    | CxComponentRuntime[][]
    | Record<string, CxComponentRuntime[]>,
  // @types 从指定 slot 开始遍历 | cmpt 处理函数
  slotOrHandler: string | Handler,
  handler?: Handler,
) => {
  const slot = typeof slotOrHandler === 'string' ? slotOrHandler : undefined
  handler = typeof slotOrHandler === 'function' ? slotOrHandler : handler || (() => ({}))

  const flatted = (
    isCxComponent(cmpts)
      ? [cmpts]
      : isCxComponentGroups(cmpts)
        ? cmpts
        : isCxComponentGroup(cmpts)
          ? cmpts
          : values(cmpts).filter(isCxComponentGroup)
  ).flat(Number.POSITIVE_INFINITY) as CxComponentRuntime[]

  flatted.forEach((cmpt) => {
    handler(cmpt)
    if (cmpt?.components) {
      slot
        ? // slot 不会传递
          touch(cmpt.components[slot]!, handler)
        : touch(cmpt.components, handler)
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
