import { isEqual, mergeWith } from 'lodash-es'

export const deepMerge = (source: any, another: any) => {
  return mergeWith(source, another, (a: any, b: any) => {
    if (Array.isArray(a) && Array.isArray(b)) {
      const n = b.filter((x) => !a.some((y) => isEqual(x, y)))
      return a.concat(n)
    }
  })
}
