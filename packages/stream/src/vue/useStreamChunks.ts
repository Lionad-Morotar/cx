import { computed, watch } from 'vue'
import type { Ref } from 'vue'

export interface ChunkStrategy {
  /** 检测标志（如 '\n\n---\n\n' 或 '\n## '） */
  marker: string
  /**
   * 分割偏移量：marker 起始位置 + offset = 下一 chunk 的起始位置
   * 分隔线全部丢弃：offset = marker.length
   * 二级标题保留 ##：offset = 2（只跳过 \n\n）
   */
  offset: number
}

export interface StreamChunk {
  content: string
  isComplete: boolean
}

/**
 * 流式内容分块检测器（多策略版）
 *
 * 在流式增长阶段按多种策略标志实时切分内容。
 * 策略重叠时按位置排序，已处理区域覆盖的匹配自动过滤。
 *
 * @param content          - 响应式流式内容
 * @param strategies       - 分块策略数组
 * @param onChunkDetected  - 检测到新完整块时的回调（流式阶段实时触发）
 */
export function useStreamChunks(
  content: Ref<string>,
  strategies: ChunkStrategy[],
  onChunkDetected?: (chunk: string, index: number) => void,
) {
  /** 已触发回调的完整块数量 */
  let lastDetectedCount = 0

  /**
   * 解析内容中所有策略匹配，按位置排序，过滤重叠。
   */
  function findAllMatches(full: string) {
    const matches: Array<{ idx: number; offset: number }> = []

    for (const strategy of strategies) {
      let searchFrom = 0
      while (true) {
        const idx = full.indexOf(strategy.marker, searchFrom)
        if (idx === -1) break
        matches.push({ idx, offset: strategy.offset })
        searchFrom = idx + strategy.marker.length
      }
    }

    matches.sort((a, b) => a.idx - b.idx)

    const filtered: Array<{ idx: number; offset: number }> = []
    let lastEnd = -1
    for (const m of matches) {
      if (m.idx >= lastEnd) {
        filtered.push(m)
        lastEnd = m.idx + m.offset
      }
    }

    return filtered
  }

  /**
   * 所有块（含未完成的最后一个）
   * - isComplete=true:  已被分隔符封底的完整块
   * - isComplete=false: 最后一个分隔符之后、仍在增长的内容
   */
  const chunks = computed<StreamChunk[]>(() => {
    const full = content.value
    if (!full) return []

    const matches = findAllMatches(full)
    const result: StreamChunk[] = []
    let pos = 0

    for (const m of matches) {
      result.push({ content: full.slice(pos, m.idx), isComplete: true })
      pos = m.idx + m.offset
    }

    result.push({ content: full.slice(pos), isComplete: false })
    return result
  })

  // immediate 确保已有内容也能被处理（如刷新恢复场景）
  watch(
    content,
    (full) => {
      if (!full || !onChunkDetected) return

      const matches = findAllMatches(full)
      let count = 0
      let pos = 0

      for (const m of matches) {
        if (count >= lastDetectedCount) {
          onChunkDetected(full.slice(pos, m.idx), count)
        }
        count++
        pos = m.idx + m.offset
      }

      lastDetectedCount = count
    },
    { immediate: true },
  )

  return { chunks }
}
