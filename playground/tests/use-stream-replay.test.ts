// 回放引擎 composable 的进度语义契约：归零态不得送出任何 chunk——
// 「<= 边界」会让 progress=1、streamText 已含首 chunk，未播放的页面
// 原始流非空、detector 误呈 pending，与「播放才开始流」的契约冲突。
import { describe, expect, it } from 'vitest'
import { ref } from 'vue'

import { useStreamReplay } from '~/dev/use-stream-replay'

const CHUNKS = ['```json\n[', '\n  { "id": "a" }', '\n]\n```']

describe('useStreamReplay 进度语义', () => {
  it('初始（未播放）progress=0 且 streamText 为空', () => {
    const { progress, streamText } = useStreamReplay(ref(CHUNKS))
    expect(progress.value).toBe(0)
    expect(streamText.value).toBe('')
  })

  it('reset 后回到零进度空流', () => {
    const { progress, streamText, reset } = useStreamReplay(ref(CHUNKS))
    reset()
    expect(progress.value).toBe(0)
    expect(streamText.value).toBe('')
  })

  it('剧本切换（chunks 引用变更）自动归零', async () => {
    const chunks = ref(CHUNKS)
    const { progress, streamText } = useStreamReplay(chunks)
    chunks.value = ['```json\n{}', '\n```']
    await Promise.resolve()
    expect(progress.value).toBe(0)
    expect(streamText.value).toBe('')
  })
})
