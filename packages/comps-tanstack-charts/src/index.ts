import CxTanstackChartsChart from './chart'
import CxTanstackChartsLine from './line'
import CxTanstackChartsBar from './bar'
import CxTanstackChartsArea from './area'
import CxTanstackChartsDot from './dot'
import CxTanstackChartsPie from './pie'

import type { CxMaterialBundle } from '@lionad/cx-definition'

export { default as CxTanstackChartsChart } from './chart'
export { default as CxTanstackChartsLine } from './line'
export { default as CxTanstackChartsBar } from './bar'
export { default as CxTanstackChartsArea } from './area'
export { default as CxTanstackChartsDot } from './dot'
export { default as CxTanstackChartsPie } from './pie'
export * from './shared/translate'

/** TanStack Charts 物料数组：通用 chart + 笛卡尔预设（line/bar/area/dot）+ 饼图 */
export const CxTanstackCharts = [
  CxTanstackChartsChart,
  CxTanstackChartsLine,
  CxTanstackChartsBar,
  CxTanstackChartsArea,
  CxTanstackChartsDot,
  CxTanstackChartsPie,
]

/** TanStack Charts 物料 bundle：自描述单元，供装配方（cx-nuxt 等）按 bundle 装配 */
export const CxTanstackChartsBundle: CxMaterialBundle = {
  name: 'tanstack-charts',
  materials: [...CxTanstackCharts],
}
