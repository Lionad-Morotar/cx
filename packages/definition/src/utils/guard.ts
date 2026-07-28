import { unref } from 'vue'
export const boolToCompare = (b: boolean) => (b ? 1 : -1)

export const safeNum = (x: unknown, defaultValue: number = 0) => {
  const num = Number(x)
  return isNaN(num) ? defaultValue : num
}

export const safeStr = (x: unknown, defaultValue: string = '') => {
  return typeof x === 'string' ? x : defaultValue
}

export const has = (x?: unknown) => Boolean(unref(x))
export const not = (x?: unknown) => !unref(x)
export const hasKey = (x: object, key: string) =>
  Object.prototype.hasOwnProperty.call(x, key)
export const hasNil = (x: object) => Object.values(x).some((v) => v === null || v === undefined)
export const hasSize = (x: Record<PropertyKey, unknown> | unknown[] | Set<unknown> | null | undefined) => {
  if (Array.isArray(x)) {
    return x.length > 0
  } else if (x instanceof Set) {
    return x.size > 0
  } else if (x && typeof x === 'object') {
    return Object.keys(x).length > 0
  }
  return false
}
