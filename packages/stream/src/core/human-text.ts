/**
 * 人类可读文本提取
 *
 * 从流式传输中的部分 JSON（可能未闭合，无法 JSON.parse）里字符级扫描字符串值，
 * 过滤键名与技术性值（图标协议、短标识符），保留有意义的人类文本，
 * 供 pending 阶段打字机预览使用；结构化提取失败时回退到 markdown 句子提取。
 */

import removeMarkdown from 'remove-markdown'

/** 超过 maxLen 字符截断为 maxLen-1 + '...' */
export function truncate(text: string, maxLen = 40): string {
  return text.length <= maxLen ? text : text.slice(0, maxLen - 1) + '...'
}

/** 剥离 markdown 格式，失败回退原文 */
export function stripMarkdown(raw: string): string {
  try {
    return removeMarkdown(raw) || raw
  } catch {
    return raw
  }
}

export interface HumanTextConfig {
  /** 结构化文本识别门：不满足返回 null，交由 markdown 句子回退 */
  looksLikeStructured: (text: string) => boolean
  /** 技术性值前缀（命中即过滤），默认 ['lucide:'] */
  technicalPrefixes?: string[]
  /** 值是否为有意义的人类文本，默认：含 CJK 字符或非短标识符且 ≥4 字符 */
  isMeaningful?: (value: string) => boolean
  /** 从候选值列表选择最终文本，默认：优先最后一个含 CJK 的值，否则最后一个 */
  pick?: (values: string[]) => string | null
}

const HAS_CJK = /[一-鿿]/
const IS_SHORT_ID = /^[a-zA-Z0-9_-]+$/

export const defaultHumanTextConfig: Required<Omit<HumanTextConfig, 'looksLikeStructured'>> = {
  technicalPrefixes: ['lucide:'],
  isMeaningful: (value) => HAS_CJK.test(value) || (!IS_SHORT_ID.test(value) && value.length >= 4),
  pick: (values) => {
    for (let k = values.length - 1; k >= 0; k--) {
      const v = values[k]!
      if (HAS_CJK.test(v) && v.length >= 2) return v
    }
    return values.at(-1) ?? null
  },
}

/**
 * 从结构化文本（JSON 流）中提取人类可读字段值。
 * 不依赖 JSON.parse——流式内容可能截断，通过字符级扫描双引号字符串实现。
 */
export function extractStructuredHumanText(raw: string, config: HumanTextConfig): string | null {
  const technicalPrefixes = config.technicalPrefixes ?? defaultHumanTextConfig.technicalPrefixes
  const isMeaningful = config.isMeaningful ?? defaultHumanTextConfig.isMeaningful
  const pick = config.pick ?? defaultHumanTextConfig.pick

  // 去掉 markdown 代码块标记
  const text = raw
    .replace(/^```(?:\w+)?\s*/im, '')
    .replace(/```\s*$/, '')
    .trim()

  if (!config.looksLikeStructured(text)) return null

  const values: string[] = []
  let i = 0

  while (i < text.length) {
    if (text[i] !== '"') {
      i++
      continue
    }

    // 查找字符串结束位置（处理转义）
    let j = i + 1
    while (j < text.length) {
      if (text[j] === '\\') {
        j += 2
      } else if (text[j] === '"') {
        break
      } else {
        j++
      }
    }
    if (j >= text.length) break // 未闭合，终止

    const val = text.slice(i + 1, j).replace(/\\(.)/g, '$1')
    const afterQuote = text.slice(j + 1).trimStart()

    // 跳过键名：后面紧跟 : 的字符串是键名
    if (afterQuote.startsWith(':')) {
      i = j + 1
      continue
    }

    const isTechnical = technicalPrefixes.some((p) => val.startsWith(p))
    if (isTechnical || val.length < 2) {
      i = j + 1
      continue
    }

    if (isMeaningful(val)) values.push(val)

    i = j + 1
  }

  if (values.length === 0) return null
  return pick(values)
}

/** 提取最后一个完整句子，无边界时回退到最后一个 JSON key */
export function extractLastSentence(text: string): string | null {
  if (!text) return null

  const segments: string[] = []
  let lastEnd = 0

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!
    let boundary = false

    if ('：。？！?!'.includes(ch)) {
      boundary = true
    } else if (ch === '.') {
      const next = text[i + 1]
      boundary = next === undefined || !/[a-zA-Z0-9]/.test(next)
    }

    if (boundary) {
      const seg = text.slice(lastEnd, i + 1).trim()
      if (seg) segments.push(seg)
      lastEnd = i + 1
    }
  }

  if (segments.length > 0) {
    // 过滤纯标点/空白片段（如 "Loading..." 拆出的 "."）
    const last = segments.filter((s) => !/^[\s.!?。：？！]+$/.test(s)).at(-1)
    if (last) return truncate(last)
  }

  let lastKey: string | null = null
  for (const m of text.matchAll(/"([^"]+)"\s*:/g)) lastKey = m[1]!
  return lastKey ? truncate(lastKey) : null
}

/** 综合提取：优先结构化字段值，其次 markdown 句子 */
export function extractDisplayText(raw: string, config: HumanTextConfig): string | null {
  const structured = extractStructuredHumanText(raw, config)
  if (structured) return truncate(structured)
  return extractLastSentence(stripMarkdown(raw))
}

// --- 趣味化装饰 ---

export interface FunRule {
  match: RegExp
  templates: Array<(matched: string) => string>
}

export const DEFAULT_FUN_RULES: FunRule[] = [
  { match: /已失效/, templates: [() => '找到已经失效的项目...'] },
  {
    match: /^[一-鿿]{2}$/g,
    templates: [
      (m) => `正在设置「${m}」按钮...`,
      (m) => `正在配置「${m}」控件...`,
      (m) => `正在填充「${m}」字段...`,
      (m) => `正在构建「${m}」条件...`,
      (m) => `正在渲染「${m}」组件...`,
      (m) => `正在加载「${m}」数据...`,
    ],
  },
]

export const DEFAULT_PUNCTUATION_POOL = ['!', '?', '~', '...', '↗', '✓', '→', '：']

const TRAILING_PUNCT_RE = /[。，、；：？！""''（）【】《》…—～.,;:!?()[\]<>~]$/

export interface FunifyOptions {
  rules?: FunRule[]
  punctuationPool?: string[]
  rand?: () => number
}

/** 趣味化装饰：规则匹配（随机模板）→ 已有尾标点跳过 → 随机尾标点 → 原样回退 */
export function funifyText(text: string, options: FunifyOptions = {}): string {
  const rules = options.rules ?? DEFAULT_FUN_RULES
  const pool = options.punctuationPool ?? DEFAULT_PUNCTUATION_POOL
  const rand = options.rand ?? Math.random

  for (const rule of rules) {
    const matched = text.match(rule.match)
    if (matched) {
      // templates 约定非空、rand()<1，索引必然命中；matched 为真时 [0] 即完整匹配
      const tpl = rule.templates[Math.floor(rand() * rule.templates.length)]!
      return tpl(matched[0]!)
    }
  }

  if (TRAILING_PUNCT_RE.test(text)) return text
  if (rand() < 0.5 && pool.length > 0) {
    const idx = Math.floor(rand() * pool.length)
    return text + pool[idx]
  }
  return text
}
