import { computed } from 'vue'

import { defineChart } from '@tanstack/charts'
import { pie, polar, radialArc } from '@tanstack/charts/polar'
import type { DomChartDefinition } from '@tanstack/charts'

import type { ComputedRef } from 'vue'
import { useChartHostProps } from './use-chart-props'
import type { CxChartHostPartition } from './use-chart-props'

export interface CxPieChartPartition extends CxChartHostPartition {
  /** pie 变换 + polar(radialArc) 组装的运行时 definition */
  definition: ComputedRef<DomChartDefinition>
}

/**
 * 饼图物料的 definition 组装：扁平通道 props（data/name/value/innerRadiusRatio）
 * → pie() 角度分配 → polar(radialArc) 扇区弧。
 *
 * 与笛卡尔预设的翻译层路径不同：pie 涉及运行时函数（pie 变换、innerRadius 比例函数），
 * 属 JSON 不可表达值的物料侧桥接，故在物料内直接组装、不经 CxChartSpec 声明式投影。
 *
 * 鲁棒性（JSON 输入不受 TS 约束）：
 * - 负值/非数值行在 pie 前过滤——pie 对负值显式抛 TypeError，不过滤会炸整棵渲染树；
 * - innerRadiusRatio 钳制 [0, 0.95]——1.0 完全空心渲染不可见，属无效配置而非有效极端；
 * - name/value 字段缺席回退 'name'/'value'（与笛卡尔预设的回退策略同形）。
 */
export function usePieChart(attrs: Record<string, unknown>): CxPieChartPartition {
  const { hostProps, ariaLabel } = useChartHostProps(attrs)
  const definition = computed(() => {
    const rows: Record<string, unknown>[] = Array.isArray(attrs.data) ? attrs.data : []
    const nameField = typeof attrs.name === 'string' && attrs.name ? attrs.name : 'name'
    const valueField = typeof attrs.value === 'string' && attrs.value ? attrs.value : 'value'
    const clean = rows.filter(
      (row) =>
        row !== null &&
        typeof row === 'object' &&
        Number.isFinite(Number(row[valueField])) &&
        Number(row[valueField]) >= 0,
    )
    const slices = pie(clean, { value: (datum) => Number(datum[valueField]) })
    const ratio =
      typeof attrs.innerRadiusRatio === 'number' && Number.isFinite(attrs.innerRadiusRatio)
        ? Math.min(Math.max(attrs.innerRadiusRatio, 0), 0.95)
        : 0
    return (defineChart as (definition: unknown) => DomChartDefinition)({
      marks: [
        polar({
          inset: 8,
          marks: [
            radialArc(slices, {
              color: (datum: Record<string, unknown>) => String(datum[nameField]),
              key: (datum: Record<string, unknown>) => String(datum[nameField]),
              innerRadius: ratio > 0 ? ({ radius }: { radius: number }) => radius * ratio : 0,
              cornerRadius: 2,
            }),
          ],
        }),
      ],
    })
  })
  return { definition, hostProps, ariaLabel }
}
