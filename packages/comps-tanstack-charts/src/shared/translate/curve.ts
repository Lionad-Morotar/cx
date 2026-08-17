import { d3Curve } from '@tanstack/charts'
import {
  curveBasis,
  curveLinear,
  curveMonotoneX,
  curveNatural,
  curveStep,
  curveStepAfter,
  curveStepBefore,
} from 'd3-shape'

import type { ChartCurve } from '@tanstack/charts'
import type { CurveFactory } from 'd3-shape'

import type { CxChartCurveName } from './types'

const CURVE_FACTORIES: Record<CxChartCurveName, CurveFactory> = {
  linear: curveLinear,
  monotoneX: curveMonotoneX,
  step: curveStep,
  stepAfter: curveStepAfter,
  stepBefore: curveStepBefore,
  basis: curveBasis,
  natural: curveNatural,
}

/** curve 枚举白名单：预设物料组装 spec 前的运行时校验（JSON 输入不受 TS 约束） */
export const CX_CHART_CURVE_NAMES = Object.keys(CURVE_FACTORIES) as CxChartCurveName[]

/** curve 枚举 → ChartCurve；未知枚举显式抛错（JSON 输入不受 TS 约束，运行时防御） */
export function translateCurve(name: CxChartCurveName): ChartCurve {
  const factory = CURVE_FACTORIES[name]
  if (!factory) {
    throw new Error(`translateCurve: 未知 curve 枚举 "${String(name)}"`)
  }
  return d3Curve(factory)
}
