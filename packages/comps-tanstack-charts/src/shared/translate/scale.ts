import { scaleLinear } from '@tanstack/charts/scales/linear'
import { scaleOrdinal } from '@tanstack/charts/scales/ordinal'
import { scalePoint } from '@tanstack/charts/scales/point'
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLog, scalePow, scaleSqrt, scaleSymlog, scaleTime, scaleUtc } from 'd3-scale'

import type { CxChartScaleSpec } from './types'

/**
 * scale 声明式 → ChartScaleInput。
 * 无 domain 时返回工厂形态（库从 marks channel 推断 domain）；
 * 有 domain 时返回实例（保留配置，库不再推断）。
 * 时间系（utc/time）domain 为 ISO 8601 字符串，翻译为 Date 实例（JSON 不可表达 Date）。
 */
export function translateScale(spec: CxChartScaleSpec): unknown {
  switch (spec.kind) {
    case 'linear':
      return spec.domain ? scaleLinear().domain(spec.domain) : scaleLinear
    case 'utc':
    case 'time': {
      const factory = spec.kind === 'utc' ? scaleUtc : scaleTime
      if (!spec.domain) return factory
      const domain: [Date, Date] = [new Date(spec.domain[0]), new Date(spec.domain[1])]
      return factory().domain(domain)
    }
    case 'log':
      return spec.domain ? scaleLog().domain(spec.domain) : scaleLog
    case 'sqrt':
      return spec.domain ? scaleSqrt().domain(spec.domain) : scaleSqrt
    case 'symlog':
      return spec.domain ? scaleSymlog().domain(spec.domain) : scaleSymlog
    case 'pow': {
      const create = () => {
        const instance = scalePow()
        return spec.exponent === undefined ? instance : instance.exponent(spec.exponent)
      }
      if (!spec.domain) return create
      return create().domain(spec.domain)
    }
    case 'point': {
      if (spec.domain) {
        const instance = scalePoint<string>().domain(spec.domain)
        return spec.padding === undefined ? instance : instance.padding(spec.padding)
      }
      return () => (spec.padding === undefined ? scalePoint() : scalePoint().padding(spec.padding))
    }
    case 'band': {
      if (spec.domain) {
        const instance = scaleBand<string>().domain(spec.domain)
        return spec.padding === undefined ? instance : instance.padding(spec.padding)
      }
      return () => (spec.padding === undefined ? scaleBand() : scaleBand().padding(spec.padding))
    }
    case 'ordinal':
      return spec.domain ? scaleOrdinal<string>().domain(spec.domain) : scaleOrdinal
    default:
      throw new Error(
        `translateScale: 未知 scale kind "${String((spec as { kind: string }).kind)}"`,
      )
  }
}
