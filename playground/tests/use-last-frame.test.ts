// 最后帧缓存的语义契约：success 后 extractor 出 null 时增量视图不清空，
// 停留在生长到最后的形态；清空时机只由 reset/剧本切换触发。
import { describe, expect, it } from 'vitest'
import { nextTick, ref } from 'vue'

import { useLastFrame } from '~/dev/use-last-frame'

describe('useLastFrame 最后帧缓存', () => {
  it('源为 null 时回退最后非空帧，源非空时跟随源', async () => {
    const source = ref<string | null>(null)
    const { frame } = useLastFrame(source)
    expect(frame.value).toBeNull()

    source.value = 'frame-1'
    await nextTick()
    expect(frame.value).toBe('frame-1')

    source.value = 'frame-2'
    await nextTick()
    expect(frame.value).toBe('frame-2')

    // 源清空（success 后 extractor 出 null）：停留最后帧
    source.value = null
    await nextTick()
    expect(frame.value).toBe('frame-2')
  })

  it('clear 后回到空，直到源再次产出', async () => {
    const source = ref<string | null>('frame-1')
    const { frame, clear } = useLastFrame(source)
    await nextTick()
    // success 态（源清空）：停留最后帧；此时 clear（reset）才真正清空
    source.value = null
    await nextTick()
    expect(frame.value).toBe('frame-1')
    clear()
    expect(frame.value).toBeNull()

    source.value = 'frame-2'
    await nextTick()
    expect(frame.value).toBe('frame-2')
  })
})
