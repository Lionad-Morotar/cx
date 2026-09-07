/**
 * 未闭合 Spec 围栏降级
 *
 * LLM 以 ```json 围栏流式输出组件树，流被中断（用户中止 / 断连 / 超时）时
 * 围栏永不闭合，落库与渲染侧会留下永久 pending 占位。本模块对含未闭合
 * spec 围栏的全文做一次性结算：降级为「部分人话摘要 + 生成中断提示」纯文本，
 * 已闭合围栏与非 spec 的未闭合代码块原样保留。
 *
 * 单实现双消费：服务端落库结算与浏览器渲染超时兜底共享同一判定，保证
 * 两侧产物一致。降级资格与 spec-detector 的 pending 分支同源共享
 * isPendingSpecFenceBlock（内容空/空白或 looksLikeSpecPrefix 命中才降级）；
 * 替换式输出天然不携带原始 JSON 与围栏原文，与 pendingSources 的泄漏隔离
 * 纪律同规——摘要提取侧同样只产人话，JSON 残文候选句与键名一律拒判。
 */

import { fenceBlockPattern, isPendingSpecFenceBlock } from './fence'
import { extractDisplayText } from './human-text'
import type { HumanTextConfig } from './human-text'
// 缺省人话配置住在 core 内（core 层自包含：禁止相对上级导入上层协议预设），
// 宿主可经 humanText 注入自有预设覆盖
import { cxHumanTextConfig } from './human-text-config'

export interface SpecFallbackConfig {
  /** 代码围栏语言标记，如 'json'；传数组时任一标记命中（如 ['json','jsonc']） */
  fence: string | string[]
  /** 未闭合代码块内容是否像 Spec 开头（空内容一律降级，防闪烁语义与 spec-detector 一致） */
  looksLikeSpecPrefix: (jsonText: string) => boolean
  /** 部分人话摘要的提取配置，缺省消费包内 cx 预设 */
  humanText?: HumanTextConfig
  /** 降级尾部提示文案，宿主可注入平台常量覆盖 */
  notice?: string
}

/** 降级输出的缺省中断提示 */
export const DEFAULT_SPEC_FALLBACK_NOTICE = '⚠️ 内容生成中断'

interface DegradedBlock {
  start: number
  end: number
  replacement: string
}

/**
 * 将全文中所有「未闭合且判定为 spec」的围栏整段替换为降级文本，其余原样返回。
 *
 * 降级形态：有摘要时「摘要 + 换行 + notice」，无摘要时仅 notice。
 * 替换从后往前执行以保偏移量（与 spec-detector 同一手法），
 * matchAll 天然按文档序归并多围栏（fence 传数组时联合为单正则一次扫描）。
 */
export function degradeUnclosedSpecFences(text: string, config: SpecFallbackConfig): string {
  const notice = config.notice ?? DEFAULT_SPEC_FALLBACK_NOTICE
  const humanTextConfig = config.humanText ?? cxHumanTextConfig

  const degraded: DegradedBlock[] = []
  for (const match of text.matchAll(fenceBlockPattern(config.fence))) {
    const fullMatch = match[0] ?? ''
    const content = match[1] ?? ''

    // 判定与 spec-detector 的 pending 分支同源共享（isPendingSpecFenceBlock）：
    // 已闭合围栏由常规管线结算，非 spec 的未闭合代码块是用户内容原样保留
    if (!isPendingSpecFenceBlock(fullMatch, content, config.looksLikeSpecPrefix)) continue

    const start = match.index ?? 0
    const summary = extractDisplayText(content, humanTextConfig)
    degraded.push({
      start,
      end: start + fullMatch.length,
      replacement: summary ? `${summary}\n${notice}` : notice,
    })
  }

  if (degraded.length === 0) return text

  let out = text
  for (let i = degraded.length - 1; i >= 0; i--) {
    const block = degraded[i]!
    out = out.slice(0, block.start) + block.replacement + out.slice(block.end)
  }
  return out
}
