/**
 * cx 协议预设 · 页面级树级 trigger 编译器
 *
 * 组件级 compileTrigger 的 scanPaths 是静态相对路径，无法寻址嵌套树内位置
 * 不固定的组件字段；树内组件也永远不会被 matchCxTrigger（只看顶层节点）命中。
 * 树级 trigger 改走闭合事件分支：管线截断至最远闭合事件 + 严格补括号后，
 * parsed 树中所有值必然完整（半值只可能位于文本末尾，截断时一并切掉），
 * 因此数组逐行 / 区域揭示 / 骨架标记都能从 parsed 内容自足推导——
 * buildPartial 深递归按节点 key 应用各物料 StreamTriggerConfig 的 closure 适配语义，
 * 无需 scanPaths 计数，管线 core 零改动。
 *
 * 剔除语义与组件级对齐：节点按其 config 判定「有无产出」，无产出即剔除
 * （连同子树），sibling 不受影响；整树无产出 → 返回 null（管线保持 lastValid）。
 * 无 config 的节点退化为 pruneIncompleteNode 语义（key 闭合即保留）。
 */

import type { IncrementalTrigger } from './core/incremental'
import type { CxSpec, CxStreamNode } from './cx'
import type {
  ArraySectionConfig,
  RegionSectionConfig,
  ScalarSectionConfig,
  StreamTriggerConfig,
} from './cx-trigger-config'

export interface CompileTreeTriggerOptions {
  /**
   * 页面级统一出帧节流（delta 数，缺省 1 = 每 delta 都可出帧）。
   * 树级模式只注册单个 trigger，各物料声明的 frameStride 不生效——
   * 逐物料节流语义留作演进空间。
   */
  frameStride?: number
}

export function compileTreeTrigger(
  configs: StreamTriggerConfig[],
  opts?: CompileTreeTriggerOptions,
): IncrementalTrigger<CxSpec> {
  // 契约校验与 compileTrigger 同一组：树级静默降级（如 scalar 组合被按 scalar
  // 处理）会让同一物料在两个验收页行为分裂，显式拒绝优于静默退化
  for (const config of configs) {
    const scalar = config.sections.find((s) => s.kind === 'scalar')
    if (scalar && config.sections.length > 1) {
      throw new Error(`compileTreeTrigger: scalar 形态不与 array/region 组合（${config.key}）`)
    }
    if (config.sections.filter((s) => s.kind === 'array').length > 1) {
      throw new Error(`compileTreeTrigger: 每 config 至多一个 array 形态（${config.key}）`)
    }
    const hasArray = config.sections.some((s) => s.kind === 'array')
    if (config.stateBranch?.emptyPassthrough && !hasArray) {
      throw new Error(`compileTreeTrigger: stateBranch 要求 array 形态（${config.key}）`)
    }
  }
  const byKey = new Map(configs.map((c) => [c.key, c]))

  /** 递归处理子树：剔除无产出/key 未闭合的子节点，保持完整前缀树语义 */
  function processComponents(components: CxStreamNode['components']): CxStreamNode['components'] {
    if (!components) return components
    if (Array.isArray(components)) {
      return components.map(processNode).filter((n): n is CxStreamNode => n !== null)
    }
    const out: Record<string, CxStreamNode[]> = {}
    for (const [slot, children] of Object.entries(components)) {
      out[slot] = children.map(processNode).filter((n): n is CxStreamNode => n !== null)
    }
    return out
  }

  /**
   * scalar 适配：与 compileTrigger 同语义（fallback ??= 补值、缺席骨架字段注入
   * _cx_streaming），closure 截断保证 data 内值皆完整；scalar 恒有产出（空壳早挂载）。
   */
  function applyScalar(node: CxStreamNode, section: ScalarSectionConfig): CxStreamNode {
    const transmitted = node.data ?? {}
    const data: Record<string, unknown> = { ...section.fallbackData, ...transmitted }
    const streaming = (section.skeletonFields ?? []).filter((field) => !(field in transmitted))
    if (streaming.length > 0) {
      data._cx_streaming = streaming
    }
    return { ...node, data, components: processComponents(node.components) }
  }

  /**
   * array 适配判定：closure 截断保证 parsed 行皆完整，无需组件级的 matches 计数。
   * 产出判据由 key 存在性自足推导——主数组缺席（未开始传输）或空数组未开
   * emptyPassthrough 时无产出；有行时 deriveTailFields ??= 推导尾随字段
   * （对齐组件级 complete>0 才推导，空态透传不推导）。
   */
  function applyArray(
    node: CxStreamNode,
    section: ArraySectionConfig,
    emptyPassthrough: boolean,
    components: CxStreamNode['components'],
  ): { node: CxStreamNode; produced: boolean } {
    const rows = node.data?.[section.arrayKey]
    if (!Array.isArray(rows)) return { node, produced: false }
    if (rows.length === 0 && !emptyPassthrough) return { node, produced: false }
    let data = node.data
    if (section.deriveTailFields && rows.length > 0) {
      const next: Record<string, unknown> = { ...node.data }
      for (const [k, v] of Object.entries(section.deriveTailFields(rows))) {
        next[k] ??= v
      }
      data = next
    }
    return { node: { ...node, data, components }, produced: true }
  }

  /**
   * region 适配产出判定：closure 模式 slot key 存在 ⟺ 已开始传输（jsonrepair
   * 不伪造值），空数组是合法终态必须保留——组件级「计数 0 移除」照搬到树级
   * 会把终态帧的真空 slot 剔掉。树级只需产出判定，components 原样透传
   * （processComponents 已完成递归修剪与嵌套形态应用）。
   */
  function regionProduced(
    section: RegionSectionConfig,
    components: CxStreamNode['components'],
  ): boolean {
    if (!components || Array.isArray(components)) return false
    return section.slots.some((slot) => slot in components)
  }

  function processNode(node: CxStreamNode): CxStreamNode | null {
    if (!node.key) return null
    const config = byKey.get(node.key)
    if (!config) {
      // 无 config 节点不能直接 pruneIncompleteNode 整棵子树——后代可能有 config，
      // 保留自身（key 闭合）并继续 processNode 递归（prune 与形态应用是同一趟）
      return { ...node, components: processComponents(node.components) }
    }
    const scalar = config.sections.find((s): s is ScalarSectionConfig => s.kind === 'scalar')
    if (scalar) return applyScalar(node, scalar)

    const components = processComponents(node.components)
    const array = config.sections.find((s): s is ArraySectionConfig => s.kind === 'array')
    const region = config.sections.find((s): s is RegionSectionConfig => s.kind === 'region')

    // 各形态独立判定、整体守卫在末尾（与组件级 buildPartial 守卫位置一致）：
    // 任一形态有产出即保留，全无产出才剔除——array+region 组合物料在
    // 主数组未开始而 slot 已揭示时不被误剔
    let produced = false
    let out: CxStreamNode = { ...node, components }
    if (array) {
      const result = applyArray(
        node,
        array,
        config.stateBranch?.emptyPassthrough === true,
        components,
      )
      if (result.produced) {
        out = result.node
        produced = true
      }
    }
    if (region && regionProduced(region, components)) {
      produced = true
    }
    if (!array && !region) return { ...node, components }
    return produced ? out : null
  }

  return {
    scanPaths: [],
    usesClosureEvents: true,
    frameStride: opts?.frameStride ?? 1,
    buildPartial: (spec: CxSpec): CxSpec | null => {
      const nodes = Array.isArray(spec) ? spec : [spec]
      const pruned = nodes.map(processNode).filter((n): n is CxStreamNode => n !== null)
      if (pruned.length === 0) return null
      return (Array.isArray(spec) ? pruned : pruned[0]!) as CxSpec
    },
  }
}
