import { unref } from 'vue'
export const boolToCompare = (b: boolean) => (b ? 1 : -1)

export const safeNum = (x: any, defaultValue: number = 0) => {
  const num = Number(x)
  return isNaN(num) ? defaultValue : num
}

export const safeStr = (x: any, defaultValue: string = '') => {
  return typeof x === 'string' ? x : defaultValue
}

export const has = (x?: any) => Boolean(unref(x))
export const not = (x?: any) => !unref(x)
export const hasKey = (x: any, key: string) => Object.prototype.hasOwnProperty.call(x, key)
export const hasNil = (x: object) => Object.values(x).some((v) => v === null || v === undefined)
export const hasSize = (x: Record<any, any> | Array<any> | Set<any> | null | undefined) => {
  if (Array.isArray(x)) {
    return x.length > 0
  } else if (x instanceof Set) {
    return x.size > 0
  } else if (x && typeof x === 'object') {
    return Object.keys(x).length > 0
  }
  return false
}
