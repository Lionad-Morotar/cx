import { d3Curve } from '@tanstack/charts'
import { d3AreaXCurve } from '@tanstack/charts/d3/area-x'
import {
  curveBasis,
  curveCatmullRom,
  curveLinear,
  curveLinearClosed,
  curveMonotoneX,
  curveNatural,
  curveStep,
  curveStepAfter,
  curveStepBefore,
} from 'd3-shape'

import type { ChartCurve } from '@tanstack/charts'
import type { AreaXCurve } from '@tanstack/charts/area-x'
import type { CurveFactory } from 'd3-shape'

import type { CxChartCurveName } from './types'

const CURVE_FACTORIES: Record<CxChartCurveName, CurveFactory> = {
  linear: curveLinear,
  linearClosed: curveLinearClosed,
  monotoneX: curveMonotoneX,
  step: curveStep,
  stepAfter: curveStepAfter,
  stepBefore: curveStepBefore,
  basis: curveBasis,
  natural: curveNatural,
  catmullRom: curveCatmullRom,
}

/** curve 枚举白名单：预设物料组装 spec 前的运行时校验（JSON 输入不受 TS 约束） */
export const CX_CHART_CURVE_NAMES = Object.keys(CURVE_FACTORIES) as CxChartCurveName[]

function resolveCurveFactory(name: CxChartCurveName): CurveFactory {
  const factory = CURVE_FACTORIES[name]
  if (!factory) {
    throw new Error(`translateCurve: 未知 curve 枚举 "${String(name)}"`)
  }
  return factory
}

/** curve 枚举 → ChartCurve（line+area 函数对）；未知枚举显式抛错（JSON 输入不受 TS 约束，运行时防御） */
export function translateCurve(name: CxChartCurveName): ChartCurve {
  return d3Curve(resolveCurveFactory(name))
}

/**
 * curve 枚举 → AreaXCurve：violinY 等水平展开面积 mark 的专用包装
 * （ViolinYCurve = AreaXCurve，d3Curve 产物不提供 areaX 生成器）。
 */
export function translateAreaXCurve(name: CxChartCurveName): AreaXCurve {
  return d3AreaXCurve(resolveCurveFactory(name))
}

/**
 * curve 枚举 → 原生 d3 CurveFactory：polar radial 系（radialLine/radialArea）
 * 的 curve 参数直接消费 d3 工厂而非 ChartCurve 包装（库签名实证 CurveFactory）。
 */
export function translateRadialCurve(name: CxChartCurveName): CurveFactory {
  return resolveCurveFactory(name)
}
