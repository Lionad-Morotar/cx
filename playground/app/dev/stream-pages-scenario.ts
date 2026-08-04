import type { CxComponentRuntime } from '@lionad/cx-definition'
import {
  createTriggerRegistry,
  type CxSpec,
  type CxStreamNode,
  type IncrementalTrigger,
  type TriggerRegistry,
} from '@lionad/cx-stream'

import { dailyStandupDashboardSchema } from '~/standup/schemas/daily-standup-dashboard.schema'
import { standupListSchema } from '~/standup/schemas/standup-list.schema'
import { weeklyStandupDashboardSchema } from '~/standup/schemas/weekly-standup-dashboard.schema'

// /dev/stream/pages 验收页的剧本模块：页面级 schema（站会列表/日会/周会看板）
// → 精简 CxStreamNode → 带围栏 pretty JSON → 行边界累积切片。
// 抽成独立纯数据模块的理由同 stream-scenario.ts：无头测试直接驱动，页面只挂回放。

/**
 * CxComponentRuntime → CxStreamNode 递归精简：丢弃 props/emits/exposes/parents
 * 等运行时字段，保留 id/key/data/components（按 slot 名分组）。
 * 空 data（{}）与空 components 省略——剧本在原始流面板可读性优先，
 * 两者在渲染侧与缺席语义等价（toRenderNode 分别回退 {} 与 {}）。
 */
export function toStreamNode(node: CxComponentRuntime): CxStreamNode {
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
  /** 页面标识（选择器 value） */
  id: string
  /** 选择器展示名 */
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
const CHUNK_MIN_CHARS = 40

/**
 * schema → 页面剧本：精简转换 → pretty JSON（2 空格，行 = 字段边界）→
 * 包 ```json 围栏（detector 三态检测依赖）→ 行边界累积切片。
 * 运行时生成（非构建期产物）：剧本与 schema 零漂移，schema 改动自动生效。
 */
export function buildPageScenario(
  id: string,
  label: string,
  schema: CxComponentRuntime[],
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

/** 页面级验收的三个目标 schema：站会列表 / 日会看板 / 周会看板 */
export const PAGE_SCENARIOS: PageScenario[] = [
  buildPageScenario('standup-list', '站会列表', standupListSchema),
  buildPageScenario('daily-dashboard', '日会看板', dailyStandupDashboardSchema),
  buildPageScenario('weekly-dashboard', '周会看板', weeklyStandupDashboardSchema),
]

/**
 * 递归修剪 key 未传完的部分节点。
 * 「id 已闭合、key 未传输」的节点是 closingBrackets 合法补全产物（真实前缀的
 * 一部分），但对增量渲染无意义——CxRender 按 key 匹配物料，key 缺失即不可渲染；
 * 修剪使出帧保持「完整传输节点组成的前缀树」语义。
 * 根节点必有 key（matchTrigger 已按 key 匹配），修剪只作用于后代。
 */
function pruneIncompleteNode(node: CxStreamNode): CxStreamNode | null {
  if (!node.key) return null
  const slots = node.components
  if (!slots) return node
  const out = { ...node }
  if (Array.isArray(slots)) {
    out.components = slots
      .map(pruneIncompleteNode)
      .filter((n): n is CxStreamNode => n !== null)
  } else {
    const components: Record<string, CxStreamNode[]> = {}
    for (const [slot, children] of Object.entries(slots)) {
      components[slot] = children
        .map(pruneIncompleteNode)
        .filter((n): n is CxStreamNode => n !== null)
    }
    out.components = components
  }
  return out
}

/**
 * 页面级增量 trigger：页面 schema 无数组主字段，增量语义是嵌套树逐步生长，
 * 走提取器的 usesClosureEvents 标量分支——截断至最远闭合事件 + 补闭合括号
 * 产出的即合法前缀树（实测各传输比例出帧均为真实前缀、零伪造节点），
 * buildPartial 只需修剪 key 未传完的部分节点，不做形状变换。
 */
const PAGE_TRIGGER: IncrementalTrigger<CxSpec> = {
  scanPaths: [],
  usesClosureEvents: true,
  buildPartial: (spec) => {
    const nodes = Array.isArray(spec) ? spec : [spec]
    const pruned = nodes
      .map(pruneIncompleteNode)
      .filter((n): n is CxStreamNode => n !== null)
    if (pruned.length === 0) return null
    return (Array.isArray(spec) ? pruned : pruned[0]!) as CxSpec
  },
}

/** 按三个页面根物料 key 注册同一标量 trigger 的注册表工厂 */
export function createPageTriggerRegistry(): TriggerRegistry<CxSpec> {
  const registry = createTriggerRegistry<CxSpec>()
  for (const s of PAGE_SCENARIOS) {
    registry.register(s.rootKey, PAGE_TRIGGER)
  }
  return registry
}
