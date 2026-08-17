import {
  binX,
  binXY,
  binY,
  boxRows,
  cumulative,
  delta,
  deviation,
  first,
  fold,
  groupBy,
  last,
  linearRegressionRowsX,
  linearRegressionRowsY,
  median,
  mosaicX,
  mosaicY,
  normalize,
  quantile,
  rank,
  ratio,
  rollingWindow,
  select,
  stackRowsX,
  stackRowsY,
  variance,
  waterfall,
} from '@tanstack/charts'
import { pie } from '@tanstack/charts/polar'

import type {
  CxChartDatasets,
  CxChartReduce,
  CxChartTransformOutputs,
  CxChartTransformSpec,
} from './types'

/**
 * 数据预处理管道翻译：spec 顶层 transforms 按序执行，产物以 name 注册进数据集表。
 * 纯函数翻译（同一输入恒同输出），流式中间态 rows 部分到达时按当时行集重算——
 * 逐行生长语义在派生数据集上同样成立。
 *
 * 断言桥：transform 函数泛型按 datum 类型参数化，JSON 翻译层 datum 恒为 unknown——
 * 运行时字段名字符串 accessor 由库内部解析（TransformValue 支持字符串），TS 泛型
 * 对 unknown 不协变，统一经 call 桥接（与 translateChartSpec 的 defineChart 断言同性质）。
 */
const call =
  (fn: unknown) =>
  (source: readonly unknown[], options: Record<string, unknown>): readonly unknown[] =>
    (fn as (s: readonly unknown[], o: Record<string, unknown>) => readonly unknown[])(
      source,
      options,
    )

/** reduce 声明式 → 库归约器；字符串枚举 count/sum/mean/min/max 原样透传，其余映射函数引用 */
export function translateReduce(reduce: CxChartReduce): unknown {
  if (typeof reduce === 'object' && reduce !== null) return quantile(reduce.quantile)
  switch (reduce) {
    case 'count':
    case 'sum':
    case 'mean':
    case 'min':
    case 'max':
      return reduce
    case 'median':
      return median
    case 'first':
      return first
    case 'last':
      return last
    case 'variance':
      return variance
    case 'deviation':
      return deviation
    case 'delta':
      return delta
    case 'ratio':
      return ratio
    default:
      throw new Error(`translateReduce: 未知 reduce "${String(reduce)}"`)
  }
}

export function translateOutputs(outputs: CxChartTransformOutputs): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [name, spec] of Object.entries(outputs)) {
    result[name] = { value: spec.value, reduce: translateReduce(spec.reduce) }
  }
  return result
}

/** 单步 transform → 行数组；源数据经 data 名查 datasets 表（缺省 rows，未命中回退空数组） */
export function translateTransform(
  spec: CxChartTransformSpec,
  datasets: CxChartDatasets,
): readonly unknown[] {
  const source = datasets[spec.data ?? 'rows'] ?? []
  const rest = spec as unknown as Record<string, unknown>
  // 公共可选字段按存在性透传（不适用者被对应 transform 忽略）
  const pick = (...keys: string[]): Record<string, unknown> => {
    const out: Record<string, unknown> = {}
    for (const k of keys) if (rest[k] !== undefined) out[k] = rest[k]
    return out
  }
  switch (spec.kind) {
    case 'groupBy':
      return call(groupBy)(source, { by: spec.by, outputs: translateOutputs(spec.outputs) })
    case 'binX':
      return call(binX)(source, {
        value: spec.value,
        ...pick('by', 'thresholds', 'domain'),
        ...(spec.outputs !== undefined ? { outputs: translateOutputs(spec.outputs) } : {}),
      })
    case 'binY':
      return call(binY)(source, {
        value: spec.value,
        ...pick('by', 'thresholds', 'domain'),
        ...(spec.outputs !== undefined ? { outputs: translateOutputs(spec.outputs) } : {}),
      })
    case 'binXY':
      return call(binXY)(source, {
        x: spec.x,
        y: spec.y,
        ...pick('by', 'xThresholds', 'yThresholds', 'xDomain', 'yDomain'),
        ...(spec.outputs !== undefined ? { outputs: translateOutputs(spec.outputs) } : {}),
      })
    case 'rollingWindow':
      return call(rollingWindow)(source, {
        size: spec.size,
        outputs: translateOutputs(spec.outputs),
        ...pick('by', 'anchor', 'partial', 'orderBy', 'order'),
      })
    case 'normalize':
      return call(normalize)(source, { value: spec.value, ...pick('by', 'as', 'basis') })
    case 'cumulative':
      return call(cumulative)(source, {
        outputs: translateOutputs(spec.outputs),
        ...pick('by', 'orderBy', 'order'),
      })
    case 'fold':
      return call(fold)(source, { fields: spec.fields, ...pick('as') })
    case 'rank':
      return call(rank)(source, { value: spec.value, ...pick('by', 'order', 'ties', 'as') })
    case 'select':
      return call(select)(source, { select: spec.select, ...pick('by', 'value') })
    case 'stackRowsY':
      return call(stackRowsY)(source, {
        x: spec.x,
        y: spec.y,
        ...pick('z', 'order', 'offset', 'reverse', 'anchor'),
      })
    case 'stackRowsX':
      return call(stackRowsX)(source, {
        x: spec.x,
        y: spec.y,
        ...pick('z', 'order', 'offset', 'reverse', 'anchor'),
      })
    case 'waterfall':
      return call(waterfall)(source, { value: spec.value, ...pick('by', 'total', 'orderBy', 'order') })
    case 'mosaicY':
      return call(mosaicY)(source, {
        x: spec.x,
        y: spec.y,
        value: spec.value,
        ...pick('xOrder', 'yOrder'),
      })
    case 'mosaicX':
      return call(mosaicX)(source, {
        x: spec.x,
        y: spec.y,
        value: spec.value,
        ...pick('xOrder', 'yOrder'),
      })
    case 'linearRegressionRowsY':
      return call(linearRegressionRowsY)(source, {
        x: spec.x,
        y: spec.y,
        ...pick('z', 'ci', 'samples'),
      })
    case 'linearRegressionRowsX':
      return call(linearRegressionRowsX)(source, {
        x: spec.x,
        y: spec.y,
        ...pick('z', 'ci', 'samples'),
      })
    case 'boxRows':
      return call(boxRows)(source, { category: spec.category, value: spec.value })
    case 'pie':
      // CX 契约统一 padAngle 命名；transform 侧字段为 gapAngle（padAngle 会被忽略）
      return call(pie)(source, {
        value: spec.value,
        ...(spec.padAngle !== undefined ? { gapAngle: spec.padAngle } : {}),
        ...pick('startAngle', 'endAngle'),
      })
    default:
      throw new Error(
        `translateTransform: 未知 transform kind "${String((spec as { kind: string }).kind)}"`,
      )
  }
}

/**
 * 执行 transforms 管道：产物以 name 注册进 datasets 副本（不污染调用方表；
 * 源数据集引用未命中时回退空数组——与 resolveMarkData 同一容错语义）。
 */
export function applyTransforms(
  transforms: readonly CxChartTransformSpec[],
  datasets: CxChartDatasets,
): CxChartDatasets {
  const table: CxChartDatasets = { ...datasets }
  for (const spec of transforms) {
    table[spec.name] = translateTransform(spec, table)
  }
  return table
}
