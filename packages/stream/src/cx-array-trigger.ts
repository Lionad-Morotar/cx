/**
 * cx 协议预设 · 数组增长型 trigger 工厂
 *
 * 大量组件的核心数据是 data 下的一个数组（行/数据点/图片/指标/标记/选项），
 * 增量语义同构：截断到「括号已平衡」的完整元素，残缺尾部（jsonrepair 补全的）
 * 不纳入。工厂把声明式字段配置转为 IncrementalTrigger，组件库只需提供自己的
 * 配置表（如 @lionad/cx-components-vtu 各组件目录的 stream-trigger.ts）。
 */

import type { IncrementalTrigger, MatchesPerPath } from './core/incremental'
import type { ScanPath } from './core/types'
import type { CxSpec, CxStreamNode } from './cx'

/** 数组增长型组件的增量规则声明式配置 */
export interface ArrayTriggerConfig {
  key: string
  /** data 下流式增长的主数组字段名 */
  arrayKey: string
  /** 主数组之外的补充扫描路径（次增长数组：列定义/系列/路线/操作按钮） */
  extraScanPaths?: ScanPath[]
  /**
   * 必需字段序列化在主数组之后时的推导兜底。
   * chart 的 xKey/series 排在数据数组之后，数据点流式期间缺席，
   * 与生成侧转译器同一推导语义补齐（真实字段已传输则不覆盖）。
   */
  deriveTailFields?: (completeRows: unknown[]) => Record<string, unknown>
}

function pickNode(spec: CxSpec, key: string): CxStreamNode | null {
  const nodes = Array.isArray(spec) ? spec : [spec]
  return nodes.find((node) => node.key === key) ?? null
}

/**
 * buildPartial 从已修复解析的前缀里只取「括号已平衡」的完整元素，截断点之后
 * 被 jsonrepair 补全的残缺元素不纳入，保证渲染出的每一项都是完整数据。
 * 无完整元素时返回 null，交由管线的 lastValid 维持上一帧（渲染端不闪没）。
 */
export function createArrayTrigger(config: ArrayTriggerConfig): IncrementalTrigger<CxSpec> {
  const mainPath: ScanPath = ['data', config.arrayKey, '*']
  return {
    scanPaths: [mainPath, ...(config.extraScanPaths ?? [])],
    buildPartial: (spec: CxSpec, matchesPerPath: MatchesPerPath): CxSpec | null => {
      const node = pickNode(spec, config.key)
      if (!node) return null

      const complete = matchesPerPath.get(JSON.stringify(mainPath))?.length ?? 0
      if (complete === 0) return null

      const rows = (node.data?.[config.arrayKey] as unknown[] | undefined) ?? []
      const data: Record<string, unknown> = {
        ...node.data,
        [config.arrayKey]: rows.slice(0, complete),
      }
      if (config.deriveTailFields) {
        for (const [k, v] of Object.entries(config.deriveTailFields(rows.slice(0, complete)))) {
          data[k] ??= v
        }
      }
      // 每次返回全新对象/数组引用，供渲染端检测变化触发重渲染
      return { ...node, data }
    },
  }
}
