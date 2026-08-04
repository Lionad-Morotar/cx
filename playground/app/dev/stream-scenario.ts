import { compositeChunks, compositeMeta } from './stream-mock.generated'

// /dev/stream/components 验收页的确定性剧本。
// 抽成独立模块（而非内联进页面）有两个原因：
// 1. 无头测试可直接驱动这些纯数据/纯函数，不必挂载 Nuxt 页面与定时器；
// 2. 页面 setup 只保留回放引擎与面板渲染，控制在可读行数内。

/**
 * 流式剧本的 chunk 序列：Coze 录制转译产物（见 stream-mock.generated.ts），
 * 边界对应真实 SSE delta 的心跳节奏。按 chunk 粒度推进回放时，
 * 管线调用次数从「字符数/步长」降到「delta 数」。
 */
export const STREAM_CHUNKS: string[] = compositeChunks

/**
 * 字符串契约的完整剧本。
 * detector / 增量管线等字符串消费者不需要感知 chunk 边界，统一消费这一根。
 */
export const STREAM_SCRIPT = STREAM_CHUNKS.join('')

/** 剧本组件数上限（composite 剧本的围栏总数） */
export const MAX_COMPONENTS = compositeMeta.fenceCount

/**
 * 把剧本裁到前 n 个组件围栏：剧本在第 n 个围栏闭合处结束，其后的散文与
 * 围栏不再出现（散文引用不存在的组件会造成语义断裂）。返回的 chunks 保持
 * 原 delta 边界，仅末 chunk 可能被截短；n 达到围栏总数时返回完整剧本，
 * 保留结尾散文。
 */
export function cropScenarioChunks(n: number): string[] {
  const end = compositeMeta.fenceEndOffsets[n - 1]
  if (end === undefined || n >= MAX_COMPONENTS) return compositeChunks
  const out: string[] = []
  let acc = 0
  for (const chunk of compositeChunks) {
    if (acc + chunk.length <= end) {
      out.push(chunk)
      acc += chunk.length
      continue
    }
    const rest = end - acc
    if (rest > 0) out.push(chunk.slice(0, rest))
    break
  }
  return out
}
