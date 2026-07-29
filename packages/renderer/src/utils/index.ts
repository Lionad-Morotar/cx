import { isEqual, mergeWith } from 'lodash-es'

export const deepMerge = (source: unknown, another: unknown) => {
  return mergeWith(source, another, (a: unknown, b: unknown) => {
    if (Array.isArray(a) && Array.isArray(b)) {
      const n = b.filter((x) => !a.some((y) => isEqual(x, y)))
      return a.concat(n)
    }
  })
}
