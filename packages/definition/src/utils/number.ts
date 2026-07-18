import BigNumber from 'bignumber.js'
type n = string | number | bigint | undefined

const defaultIndex = 0

const isNegativeInfinity = (x: n) => x === -Infinity
const isInfinity = (x: n) => x === Infinity

export const preIndex = (x: n) => {
  return new BigNumber((x ?? defaultIndex).toString()).minus(1).toFixed(0).toString()
}
export const nextIndex = (x: n) => {
  return new BigNumber((x ?? defaultIndex).toString()).plus(1).toFixed(0).toString()
}

export const checkEQIndexThan = (a: n, b: n) => {
  const _a = new BigNumber((a ?? defaultIndex).toString())
  const _b = new BigNumber((b ?? defaultIndex).toString())
  return _a.eq(_b)
}
export const checkLEIndexThan = (a: n, b: n) => {
  const _a = new BigNumber((a ?? defaultIndex).toString())
  const _b = new BigNumber((b ?? defaultIndex).toString())
  return _a.lte(_b)
}
export const checkGEIndexThan = (a: n, b: n) => {
  const _a = new BigNumber((a ?? defaultIndex).toString())
  const _b = new BigNumber((b ?? defaultIndex).toString())
  return _a.gte(_b)
}
export const checkLTIndexThan = (a: n, b: n) => {
  const _a = new BigNumber((a ?? defaultIndex).toString())
  const _b = new BigNumber((b ?? defaultIndex).toString())
  return _a.lt(_b)
}
export const checkGTIndexThan = (a: n, b: n) => {
  const _a = new BigNumber((a ?? defaultIndex).toString())
  const _b = new BigNumber((b ?? defaultIndex).toString())
  return _a.gt(_b)
}

/**
 * 返回两个排序之间的排序
 */
export const insertIndex = (a: n = -Infinity, b: n = Infinity) => {
  // console.log('[debug] insertIndex', a, b)

  if (isNegativeInfinity(a)) {
    return isInfinity(b) ? 0n : preIndex(b)
  }
  if (isInfinity(b)) {
    return isNegativeInfinity(a) ? 0n : nextIndex(a)
  }
  if (
    (isInfinity(a) && isInfinity(b)) ||
    (isNegativeInfinity(a) && isNegativeInfinity(b)) ||
    checkEQIndexThan(a, b)
  ) {
    throw new Error('cant insert same index')
  }
  // 如果 preIndex(b) === a，也对，这里默认索引有潜在的时间顺序排序
  const _a = new BigNumber((a ?? defaultIndex).toString())
  const _b = new BigNumber((b ?? defaultIndex).toString())
  return _a.plus(_b).dividedBy(2).toString()
}
