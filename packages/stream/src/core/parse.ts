import { jsonrepair } from 'jsonrepair'

export interface SafeJsonParseOptions {
  /** 超过该长度的输入跳过 jsonrepair 回退直接抛错（内存保护），默认 100KB */
  maxRepairLength?: number
}

/**
 * 带自动修复的 JSON 解析：先尝试原生 JSON.parse，
 * 失败后用 jsonrepair 修补缺失括号、尾逗号等流式截断问题。
 *
 * 注意：超长输入（默认 >100KB）解析失败时不做修复，
 * 避免 jsonrepair 在大文本上的内存开销——调用方应降级处理。
 */
export function safeJsonParse(raw: string, options: SafeJsonParseOptions = {}): unknown {
  const { maxRepairLength = 100_000 } = options
  try {
    return JSON.parse(raw)
  } catch {
    if (raw.length > maxRepairLength) {
      throw new Error(`safeJsonParse: input too large (${raw.length} chars), skipping jsonrepair`)
    }
    return JSON.parse(jsonrepair(raw))
  }
}
