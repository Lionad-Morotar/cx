import cnNumberConverter from 'number-to-chinese-words'

export function isEmptyOrFallback(x: any) {
  return !x || ['-', '/', '未知'].includes(x)
}

export const isEmpty = isEmptyOrFallback

export const fallback = <T = string>(x?: unknown, to?: T): T =>
  (x || to || '-') as unknown as NonNullable<T>

fallback.url = (x: unknown) => fallback(x, '/')
fallback.label = (x: unknown) => fallback(x, '未知')
fallback.xs = <T>(x: T): T => fallback(x, [] as T)

export const toCNNumber = cnNumberConverter.toWords
