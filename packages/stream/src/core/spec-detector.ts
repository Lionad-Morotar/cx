/**
 * Spec 检测器（三态漏斗）
 *
 * 从流式文本中检测结构化 Spec 代码块，产出三态结果：
 * - none:    不含 Spec 特征（普通文本 / 非 Spec 代码块）
 * - pending: 检测到 Spec 代码块但未闭合（流式传输中）
 * - success: JSON 完整且通过结构校验
 *
 * 闭合 Spec → 替换为 widget 占位符；未闭合 → 替换为 pending 占位符，
 * 原始 JSON 隔离进 pendingSources（防止泄漏到 markdown 渲染层被渲染成代码块）。
 *
 * 协议无关：Spec 的识别规则（前缀、结构校验、占位标签）全部经配置注入。
 */

import { fenceBlockPattern } from './fence'
import { safeJsonParse } from './parse'

/** HTML 属性值转义：防止节点 key 中的引号/尖括号破坏占位符或注入标签 */
function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export interface SpecDetectorConfig<TSpec = unknown> {
  /** 代码围栏语言标记，默认 'json'；传数组时任一标记命中（如 ['json','jsonc']） */
  fence?: string | string[]
  /** 未闭合代码块内容是否像 Spec 开头（空内容一律视为 pending，防流式初期闪烁） */
  looksLikeSpecPrefix: (jsonText: string) => boolean
  /** 裸 JSON 兜底扫描的起始位置正则（需带 g 标志） */
  rawJsonStartPattern: RegExp
  /** 解析后的结构校验 */
  isValidSpec: (parsed: unknown) => parsed is TSpec
  /** 从 Spec 提取标识键，用于占位符 data-spec-key 调试属性 */
  getSpecKey?: (spec: TSpec) => string | undefined
  /** 解析后规整（默认原样返回） */
  normalize?: (spec: TSpec) => TSpec
  /** widget 占位标签名，默认 'widget-slot' */
  widgetTag?: string
  /** pending 占位标签名，默认 'pending-slot' */
  pendingTag?: string
}

export interface ExtractSpecsResult<TSpec> {
  status: 'none' | 'pending' | 'success'
  specs: TSpec[]
  /** 首个 Spec（便捷字段） */
  spec?: TSpec
  /** 代码块已替换为占位符的 content（status !== none 时提供） */
  content?: string
  /** pending 代码块的原始 JSON 内容，按 data-pending-index 顺序排列 */
  pendingSources?: string[]
}

interface SpecBlock<TSpec> {
  spec?: TSpec
  start: number
  end: number
  /** 代码块未闭合（流式传输中） */
  pending: boolean
  /** 代码块内原始 JSON 文本（不含围栏标记） */
  jsonStr?: string
}

/**
 * 从指定位置开始，找到匹配的闭合大括号（跳过字符串内的转义字符）。
 * 用于定位裸 JSON 的结束边界；返回 null 表示尚未闭合。
 */
function findMatchingBrace(text: string, startIndex: number): number | null {
  let depth = 0
  let inString = false
  let escape = false

  for (let i = startIndex; i < text.length; i++) {
    const ch = text[i]

    if (escape) {
      escape = false
      continue
    }
    if (ch === '\\' && inString) {
      escape = true
      continue
    }
    if (ch === '"') {
      inString = !inString
      continue
    }
    if (inString) continue

    if (ch === '{') depth++
    if (ch === '}') {
      depth--
      if (depth === 0) return i
    }
  }

  return null
}

export function createSpecDetector<TSpec = unknown>(config: SpecDetectorConfig<TSpec>) {
  const fence = config.fence ?? 'json'
  const widgetTag = config.widgetTag ?? 'widget-slot'
  const pendingTag = config.pendingTag ?? 'pending-slot'
  const normalize = config.normalize ?? ((spec: TSpec) => spec)

  function keyAttr(spec: TSpec): string {
    const key = config.getSpecKey?.(spec)
    return key ? ` data-spec-key="${escapeAttr(key)}"` : ''
  }

  function widgetPlaceholder(spec: TSpec, arrayIndex: number): string {
    return `<${widgetTag} data-spec-index="INDEX_PLACEHOLDER"${keyAttr(spec)} data-spec-array-index="${arrayIndex}"></${widgetTag}>`
  }

  function pendingPlaceholder(pendingIndex: number): string {
    return `<${pendingTag} data-spec-index="INDEX_PLACEHOLDER" data-pending-index="${pendingIndex}"></${pendingTag}>`
  }

  /**
   * 兜底：检测无代码块包裹的裸 JSON Spec。
   * 仅处理已闭合的裸 JSON（未闭合的裸 JSON 无法与普通文本区分，返回 none）。
   */
  function tryRawJsonSpecs(text: string): ExtractSpecsResult<TSpec> {
    const startMatches = Array.from(text.matchAll(config.rawJsonStartPattern))
    if (startMatches.length === 0) return { status: 'none', specs: [] }

    const found: Array<{ spec: TSpec; start: number; end: number }> = []

    for (const sm of startMatches) {
      const startIndex = sm.index ?? 0
      const braceEnd = findMatchingBrace(text, startIndex)
      if (braceEnd === null) continue

      try {
        const parsed = safeJsonParse(text.slice(startIndex, braceEnd + 1))
        if (config.isValidSpec(parsed)) {
          found.push({ spec: normalize(parsed), start: startIndex, end: braceEnd + 1 })
        }
      } catch {
        /* 解析失败：该候选不是有效 Spec，跳过 */
      }
    }

    if (found.length === 0) return { status: 'none', specs: [] }

    found.sort((a, b) => a.start - b.start)
    let content = text
    let arrayIndex = found.length - 1
    // 从后往前替换，保证前面的偏移量不受影响
    for (let i = found.length - 1; i >= 0; i--) {
      const m = found[i]!
      content =
        content.slice(0, m.start) + widgetPlaceholder(m.spec, arrayIndex--) + content.slice(m.end)
    }

    const specs = found.map((m) => m.spec)
    return { status: 'success', specs, spec: specs[0], content }
  }

  /**
   * 从文本中提取 Spec（支持多个代码块）。
   *
   * 检测逻辑：
   * 1. matchAll 扫描所有围栏代码块
   * 2. 每个代码块：前缀验证 → 闭合检查 → 解析 → 结构校验
   * 3. 闭合的有效 Spec → widget 占位符
   * 4. 未闭合的 Spec 代码块 → pending 占位符（原始 JSON 隔离进 pendingSources）
   * 5. 无代码块 → 裸 JSON 兜底扫描
   */
  function extractSpecs(text: string): ExtractSpecsResult<TSpec> {
    // --- 扫描所有围栏代码块（步骤拆解见函数头注释） ---
    const codeBlockMatches = Array.from(text.matchAll(fenceBlockPattern(fence)))

    if (codeBlockMatches.length === 0) {
      return tryRawJsonSpecs(text)
    }

    const blocks: Array<SpecBlock<TSpec>> = []

    for (const match of codeBlockMatches) {
      const jsonStr = match[1] ?? ''
      const fullMatch = match[0] ?? ''
      const matchIndex = match.index ?? 0

      const hasClosing = fullMatch.endsWith('```')

      if (!hasClosing) {
        // 未闭合代码块：内容为空/空白或像 Spec 开头，都当作 pending——
        // 避免 markdown 渲染器在流式初期看到空围栏时渲染成代码块闪烁
        if (jsonStr.trim() === '' || config.looksLikeSpecPrefix(jsonStr)) {
          blocks.push({
            start: matchIndex,
            end: matchIndex + fullMatch.length,
            pending: true,
            jsonStr,
          })
        }
        continue
      }

      // 已闭合代码块：只处理像 Spec 的内容
      if (!config.looksLikeSpecPrefix(jsonStr)) continue

      try {
        const parsed = safeJsonParse(jsonStr.trim())
        if (config.isValidSpec(parsed)) {
          blocks.push({
            spec: normalize(parsed),
            start: matchIndex,
            end: matchIndex + fullMatch.length,
            pending: false,
          })
        }
      } catch {
        /* 解析失败：保留为普通代码块 */
      }
    }

    if (blocks.length === 0) return { status: 'none', specs: [] }

    const specs = blocks.flatMap((b) => (b.spec ? [b.spec] : []))
    const hasPending = blocks.some((b) => b.pending)

    blocks.sort((a, b) => a.start - b.start)

    // 全部未闭合 → pending
    if (specs.length === 0 && hasPending) {
      let content = text
      const pendingSources: string[] = []
      let pendingIndex = 0
      // 从后往前替换以保偏移量；副作用是 pendingSources 呈文档序倒序，
      // [0] 恰是正在流式的最后一个块——下游依赖此顺序取当前块（见混合态分支）
      for (let i = blocks.length - 1; i >= 0; i--) {
        const b = blocks[i]!
        content =
          content.slice(0, b.start) + pendingPlaceholder(pendingIndex++) + content.slice(b.end)
        pendingSources.push(b.jsonStr ?? '')
      }
      return { status: 'pending', specs: [], content, pendingSources }
    }

    // 混合/全闭合：闭合 → widget 占位符，未闭合 → pending 占位符
    // 统一遍历确保 pending 块的原始 JSON 也被替换隔离
    let arrayIndex = specs.length - 1
    let pendingIndex = 0
    const pendingSources: string[] = []
    let content = text
    // 从后往前替换以保偏移量；同时让 pendingSources 呈文档序倒序，
    // [0] 恰是正在流式的最后一个块——下游（增量管线、打字机预览）依赖
    // 该顺序取当前块，「修正」为正序会造成多围栏场景静默错位
    for (let i = blocks.length - 1; i >= 0; i--) {
      const b = blocks[i]!
      if (b.pending && !b.spec) {
        content =
          content.slice(0, b.start) + pendingPlaceholder(pendingIndex++) + content.slice(b.end)
        pendingSources.push(b.jsonStr ?? '')
      } else if (b.spec) {
        content =
          content.slice(0, b.start) + widgetPlaceholder(b.spec, arrayIndex--) + content.slice(b.end)
      }
    }

    return {
      status: 'success',
      specs,
      spec: specs[0],
      content,
      pendingSources: pendingSources.length > 0 ? pendingSources : undefined,
    }
  }

  return { extractSpecs }
}
