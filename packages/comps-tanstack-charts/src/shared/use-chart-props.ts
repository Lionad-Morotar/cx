import { computed } from 'vue'

import type { ComputedRef } from 'vue'
import type { CxChartSpec } from './translate'

/** <Chart> 宿主标量 props 白名单（回调 function props v1 不暴露：JSON 不可表达） */
const HOST_PROP_KEYS = [
  'ariaDescription',
  'height',
  'width',
  'aspectRatio',
  'tabIndex',
  'idPrefix',
  'className',
] as const

export interface CxChartHostPartition {
  /** <Chart> 宿主 props（标量白名单 + class/style） */
  hostProps: ComputedRef<Record<string, unknown>>
  /** Chart 必填 ariaLabel，独立绑定（v-bind 对象无法向模板类型检查证明 required 键在场） */
  ariaLabel: ComputedRef<string>
}

export interface CxChartPropsPartition extends CxChartHostPartition {
  /** 物料 JSON definition（声明式 spec，待翻译层组装） */
  spec: ComputedRef<CxChartSpec>
}

/**
 * 分馏 <Chart> 宿主 props：标量白名单 + class/style + ariaLabel 回退。
 *
 * 剥离 cx 内部键（comp 运行时节点、data-* 编辑标记、_ 前缀编辑器键），与 vtu/EP 桥接同形。
 * class/style 保留进 hostProps（cx 编辑器样式类落到 Chart 根宿主 div）。
 * ariaLabel 是 Chart 必填 prop，缺省回退物料中文名；它与 hostProps 分开返回，
 * 由包装层显式绑定，否则模板类型检查把 v-bind 的 Record 当作 required 键缺席。
 * 预设物料与通用 chart 共用本函数——差异只在 spec 来源（definition 键 vs 通道组装）。
 */
export function useChartHostProps(attrs: Record<string, unknown>): CxChartHostPartition {
  const hostProps = computed(() => {
    const result: Record<string, unknown> = {}
    for (const key of HOST_PROP_KEYS) {
      if (attrs[key] !== undefined) result[key] = attrs[key]
    }
    if (attrs.class !== undefined) result.class = attrs.class
    if (attrs.style !== undefined) result.style = attrs.style
    return result
  })
  const ariaLabel = computed(() => (attrs.ariaLabel as string | undefined) || '图表')
  return { hostProps, ariaLabel }
}

/**
 * 通用 chart 物料的分馏：definition 键 → spec，外加宿主 props。
 *
 * definition 键从透传集中分馏——Chart 组件的 definition prop 只接受运行时产物，
 * 物料侧的 JSON spec 须经翻译层组装后由包装层显式绑定，不能随 v-bind 原样透传。
 * 返回独立 computed 而非整体 ref：包装层分别绑定，避免解构丢响应性。
 */
export function useChartProps(attrs: Record<string, unknown>): CxChartPropsPartition {
  const { hostProps, ariaLabel } = useChartHostProps(attrs)
  const spec = computed<CxChartSpec>(
    () => (attrs.definition as CxChartSpec | undefined) ?? { marks: [] },
  )
  return { spec, hostProps, ariaLabel }
}
