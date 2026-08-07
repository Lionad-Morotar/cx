/**
 * cx-scenario — 页面级剧本组装：CxComponentRuntime → 精简 CxStreamNode →
 * 带 ```json 围栏 pretty JSON → 行边界累积 chunks。
 *
 * 剧本是「schema 的流式回放形态」：边界只在 pretty-print 行末切分，
 * 增量帧随容器括号闭合逐字段生长，供 spec detector / 增量管线消费。
 * 与 cx.ts 同一解耦约束：输入取结构子集（CxStreamNodeSource），
 * 不 import @lionad/cx-definition，保持流式管线对组件库类型解耦。
 */
import type { CxStreamNode } from './cx'

/**
 * 可精简为 CxStreamNode 的结构源：CxComponentRuntime 的结构子集
 * （运行时字段 name/props/emits/exposes/parents/aliasKeys 在此不可见，
 * 传入时被丢弃）。components 恒为按 slot 名分组——数组形式是 LLM 输出契约，
 * 剧本组装侧只接受运行时形态。components 容忍 null：CxComponentRuntime
 * 的运行时形态即 `Record | null`（cxNode 工厂对无子节点组件产 null），
 * 结构输入契约应原样承接而非要求消费方收窄。
 */
export interface CxStreamNodeSource {
  id: string
  key: string
  data?: Record<string, unknown>
  components?: Record<string, CxStreamNodeSource[]> | null
}

/**
 * CxStreamNodeSource → CxStreamNode 递归精简：丢弃运行时字段，
 * 保留 id/key/data/components（按 slot 名分组）。
 * 空 data（{}）与空 components 省略——剧本在原始流面板可读性优先，
 * 两者在渲染侧与缺席语义等价（hydrate 分别回退 {} 与 {}）。
 */
export function toStreamNode(node: CxStreamNodeSource): CxStreamNode {
  const out: CxStreamNode = { id: node.id, key: node.key }
  if (node.data && Object.keys(node.data).length > 0) {
    out.data = node.data
  }
  const slots = node.components ?? {}
  const slotNames = Object.keys(slots)
  if (slotNames.length > 0) {
    const components: Record<string, CxStreamNode[]> = {}
    for (const slot of slotNames) {
      components[slot] = (slots[slot] ?? []).map(toStreamNode)
    }
    out.components = components
  }
  return out
}

/** 页面剧本：schema 序列化产物 + 回放引擎消费的 chunk 序列 */
export interface PageScenario {
  /** 页面标识 */
  id: string
  /** 展示名 */
  label: string
  /** 带 ```json 围栏的完整剧本（chunks.join('') 与此逐位一致） */
  script: string
  /** 行边界累积切片：边界只在 pretty-print 行末，增量帧语义化（逐字段生长） */
  chunks: string[]
  /** 根物料 key（增量 trigger 注册与终态断言用） */
  rootKey: string
}

/**
 * chunk 最小字符数：过短的闭合括号行（"}"、"]"）独占 chunk 会产生无内容
 * 变化的空帧，累积到阈值再切；行边界优先于阈值——达到阈值后在当前行末切。
 */
export const CHUNK_MIN_CHARS = 40

/**
 * schema → 页面剧本：精简转换 → pretty JSON（2 空格，行 = 字段边界）→
 * 包 ```json 围栏（detector 三态检测依赖）→ 行边界累积切片。
 * 运行时生成（非构建期产物）：剧本与 schema 零漂移，schema 改动自动生效。
 */
export function buildPageScenario(
  id: string,
  label: string,
  schema: CxStreamNodeSource[],
): PageScenario {
  const nodes = schema.map(toStreamNode)
  const script = '```json\n' + JSON.stringify(nodes, null, 2) + '\n```'
  const lines = script.split('\n')
  const chunks: string[] = []
  let buf = ''
  for (const [i, line] of lines.entries()) {
    buf += line + (i < lines.length - 1 ? '\n' : '')
    if (buf.length >= CHUNK_MIN_CHARS) {
      chunks.push(buf)
      buf = ''
    }
  }
  if (buf) chunks.push(buf)
  return { id, label, script, chunks, rootKey: nodes[0]!.key }
}
