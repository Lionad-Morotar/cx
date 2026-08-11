import CxTanstackChartsChart from './chart'

import type { CxMaterialBundle } from '@lionad/cx-definition'

export { default as CxTanstackChartsChart } from './chart'
export * from './shared/translate'

/**
 * TanStack Charts 物料数组：S1 地基期为通用 chart 一件 tracer；
 * 随 Slice 增长补 line/bar/area/dot/pie 预设。
 */
export const CxTanstackCharts = [CxTanstackChartsChart]

/** TanStack Charts 物料 bundle：自描述单元，供装配方（cx-nuxt 等）按 bundle 装配 */
export const CxTanstackChartsBundle: CxMaterialBundle = {
  name: 'tanstack-charts',
  materials: [...CxTanstackCharts],
}
