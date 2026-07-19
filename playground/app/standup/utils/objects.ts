import { unref } from 'vue'

export function isObject(item: any) {
  return (
    item &&
    typeof item === 'object' &&
    !Array.isArray(item) &&
    !(item instanceof HTMLElement) &&
    typeof item !== 'function'
  )
}

export const simpleCloneDeep = <T>(arg: T): T => JSON.parse(JSON.stringify(arg))
