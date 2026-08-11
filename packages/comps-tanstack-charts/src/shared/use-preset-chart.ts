import { computed } from 'vue'

import type { ComputedRef } from 'vue'
import { useChartHostProps } from './use-chart-props'
import type { CxChartHostPartition } from './use-chart-props'
import { CX_CHART_CURVE_NAMES } from './translate'
import type { CxChartCurveName, CxChartMarkType, CxChartScaleSpec, CxChartSpec } from './translate'

export interface CxPresetChartOptions {
  /** 预设 mark 类型（lineY/barY/areaY/dot 等笛卡尔单通道 mark） */
  markType: CxChartMarkType
  /** x 轴 scale kind（序列类用 point/band，数值散点用 linear） */
  xScale: CxChartScaleSpec['kind']
  /** 是否消费 curve 通道（line/area 支持，bar/dot 忽略） */
  withCurve?: boolean
}

export interface CxPresetChartPartition extends CxChartHostPartition {
  /** 由通道 props（data/x/y/curve）组装的声明式 spec */
  spec: ComputedRef<CxChartSpec>
}

/**
 * 预设物料的 spec 组装：把扁平通道 props（data 行数组 + x/y 字段名 + curve 枚举）
 * 投影为单 mark 的 CxChartSpec，与通用 chart 物料共用翻译层与宿主 props 分馏。
 *
 * 通道缺席回退固定字段名（x→'x'、y→'y'）而非省略：translateMark 对非字符串 channel
 * 显式抛错，流式中间态/编辑器清空场景下回退保证规格恒可翻译；data 缺席回退空数组
 * （mark 渲染为空而非抛错）。meta.props 的 initial 三元组（data 行键/x 值/y 值）
 * 必须自洽——initial 不参与运行时校验，漂移无任何报错（vtu 既有教训）。
 */
export function usePresetChart(
  attrs: Record<string, unknown>,
  options: CxPresetChartOptions,
): CxPresetChartPartition {
  const { hostProps, ariaLabel } = useChartHostProps(attrs)
  const spec = computed<CxChartSpec>(() => {
    const mark: CxChartSpec['marks'][number] = {
      type: options.markType,
      data: Array.isArray(attrs.data) ? attrs.data : [],
      x: typeof attrs.x === 'string' && attrs.x ? attrs.x : 'x',
      y: typeof attrs.y === 'string' && attrs.y ? attrs.y : 'y',
    }
    // curve 仅注入白名单命中值：流式中间态可能是半截字符串（"monot"），
    // 直接透传会让 translateCurve 抛错炸掉整棵渲染树
    if (
      options.withCurve &&
      typeof attrs.curve === 'string' &&
      (CX_CHART_CURVE_NAMES as string[]).includes(attrs.curve)
    ) {
      mark.curve = attrs.curve as CxChartCurveName
    }
    return {
      marks: [mark],
      x: { scale: { kind: options.xScale } },
      y: { scale: { kind: 'linear' }, grid: true },
    }
  })
  return { spec, hostProps, ariaLabel }
}
