/**
 * 尺码序列与标签（原为 p-ray composables/nuxt-ui 的 sizes 链）。
 */
const sizesMap: Record<string, string> = {
  '3xs': '超级小',
  '2xs': '极小',
  xs: '超小',
  sm: '小',
  md: '中',
  lg: '大',
  xl: '超大',
  '2xl': '特大',
  '3xl': '超级大',
}
const getSizeLabel = (size: string) => {
  return sizesMap[size] || size
}

const sizes = ['3xs', '2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const

type Size = (typeof sizes)[number]

/** 生成从 x 到 y 的尺码区间（含两端） */
export const useSize = <X extends Size, Y extends Size>(x: X, y: Y) => {
  const indexX = sizes.indexOf(x)
  const indexY = sizes.indexOf(y)
  return indexX === -1 || indexY === -1 ? [] : sizes.slice(indexX, indexY + 1)
}

export const useSizeOptions = (x: Size, y: Size) => {
  return useSize(x, y).map((size) => ({ label: getSizeLabel(size), value: size }))
}
