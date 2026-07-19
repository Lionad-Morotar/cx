/**
 * radash clone 的最小等价（浅拷贝）：数组/对象展开，其余原样返回。
 * p-ray 经 nuxt-radashi auto-import 为 useClone。
 */
export const useClone = <T>(x: T): T => {
  if (Array.isArray(x)) return [...x] as T
  if (x && typeof x === 'object') return { ...x } as T
  return x
}
