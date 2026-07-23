/**
 * cx 协议预设
 *
 * @lionad/cx-stream 的管线机制对协议无感知；本文件提供面向 cx 组件树协议
 * （@lionad/cx-definition）的默认检测配置与节点类型。
 *
 * LLM 输出的最小契约：`{ id?, key, data?, components? }`——
 * 其余运行时字段（name/props/emits/exposes）由 cx-render 经
 * createComponent/reInitComponent 从组件元信息自动补全。
 */

import type { HumanTextConfig } from './core/human-text'
import type { IncrementalTrigger, TriggerRegistry } from './core/incremental'
import type { SpecDetectorConfig } from './core/spec-detector'

/**
 * LLM 可输出的 cx 组件节点最小契约。
 *
 * 有意自包含而非派生自 @lionad/cx-definition：LLM 只产出最小子集
 * （`id` 缺省、`components` 允许数组或按 slot 分组），由 cx-render 水合
 * （hydrate）为运行时树节点（对应 CxComponentLoose）。保持独立契约可让
 * 流式管线对组件库类型解耦，预设可替换。
 */
export interface CxStreamNode {
  /** 稳定标识；缺省时由 cx 运行时生成。流式渐进渲染建议由调用侧保持稳定 */
  id?: string
  /** 组件 key，如 'cx-demo-table' */
  key: string
  name?: string
  /** 组件数据，与组件元信息的默认值合并 */
  data?: Record<string, unknown>
  /** 子组件树：数组或按 slot 名分组 */
  components?: CxStreamNode[] | Record<string, CxStreamNode[]>
}

/** cx Spec：单根节点或顶层节点数组（cx-render 渲染首元素，多节点建议用布局容器承载） */
export type CxSpec = CxStreamNode | CxStreamNode[]

function isCxNode(parsed: unknown): parsed is CxStreamNode {
  return (
    !!parsed &&
    typeof parsed === 'object' &&
    !Array.isArray(parsed) &&
    typeof (parsed as CxStreamNode).key === 'string'
  )
}

/** cx 节点结构校验：单个节点，或非空且全部合法的节点数组 */
function isValidCxSpec(parsed: unknown): parsed is CxSpec {
  return isCxNode(parsed) || (Array.isArray(parsed) && parsed.length > 0 && parsed.every(isCxNode))
}

/**
 * cx 预设的 Spec 检测配置。
 *
 * 约定（需在生成 Spec 的 prompt 中配合）：
 * - Spec 置于 ```json 代码块内（或裸 JSON 兜底）
 * - 对象首个字段为 `id` 或 `key`（用作流式初期的快速识别标记）
 */
export const cxSpecDetectorConfig: SpecDetectorConfig<CxSpec> = {
  // 只接受标准 JSON（双引号）：core 管线的字符级扫描仅处理双引号字符串，
  // 预设宽松识别单引号会造成"能检出但增量渲染失效"的契约裂缝
  looksLikeSpecPrefix: (text) => /^\s*(?:\[\s*)?\{\s*"(?:id|key)"/.test(text),
  rawJsonStartPattern: /\{\s*"(?:id|key)"\s*:/g,
  isValidSpec: isValidCxSpec,
  getSpecKey: (spec) => (Array.isArray(spec) ? spec[0]?.key : spec.key),
}

/**
 * cx 预设的人类文本提取配置：以 `"key":` 标记识别 cx Spec 流。
 * 供 usePendingTypewriter 的 humanText 选项使用。
 */
export const cxHumanTextConfig: HumanTextConfig = {
  looksLikeStructured: (text) => /["']key["']\s*:/.test(text),
}

/**
 * cx 协议匹配器：按节点 key 在注册表中查找 trigger。
 * 数组根取首个命中的节点。供 createIncrementalExtractor 的 matchTrigger 使用。
 */
export function matchCxTrigger(
  spec: CxSpec,
  registry: TriggerRegistry<CxSpec>,
): [string, IncrementalTrigger<CxSpec>] | null {
  const nodes = Array.isArray(spec) ? spec : [spec]
  for (const node of nodes) {
    const trigger = registry.get(node.key)
    if (trigger) return [node.key, trigger]
  }
  return null
}
