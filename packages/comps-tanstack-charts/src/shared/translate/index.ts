/**
 * 声明式 JSON → TanStack Charts 运行时定义的翻译层（桶文件）。
 * 模块分工：types（声明式契约）/ curve / scale / axis / mark（基础+spatial）/
 * transforms（数据预处理管道）/ polar（极坐标族）/ composite（七类命名复合）/
 * view（viewGrid 多视图组合）/ definition（translateChartSpec 组装入口）。
 */

export type {
  CxChartAxisSpec,
  CxChartCurveName,
  CxChartDatasets,
  CxChartForceSpec,
  CxChartLayoutSpec,
  CxChartMarkSpec,
  CxChartMarkType,
  CxChartPolarGuideSpec,
  CxChartReduce,
  CxChartScaleSpec,
  CxChartSpec,
  CxChartTransformOutputs,
  CxChartTransformSpec,
  CxChartViewGridSpec,
  CxChartViewItem,
  CxChartViewLink,
  CxChartViewTrack,
} from './types'

export { CX_CHART_CURVE_NAMES, translateCurve } from './curve'
export { translateScale } from './scale'
export { translateAxis } from './axis'
export { resolveMarkData, resolveRScaleOption, translateMark } from './mark'
export { applyTransforms, translateOutputs, translateReduce, translateTransform } from './transforms'
export { POLAR_FAMILY_TYPES, translatePie, translatePolar } from './polar'
export { COMPOSITE_TYPES, translateCompositeMark } from './composite'
export { translateChartSpec } from './definition'
