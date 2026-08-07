import { describe, expect, it } from 'vitest'
import { ref } from 'vue'

import { useLastFrame } from '../src/vue/useLastFrame'

/**
 * useLastFrame 行为契约：增量视图的最后帧缓存——流播完（success）后
 * pendingSource 清空、extractor 出 null，缓存最后非空帧让增量视图停留在
 * 最后一帧（增量管线与终态渲染是同一棵树的两种时态，而非接力交接）。
 */

describe('useLastFrame', () => {
  it('非空值入缓存，frame 跟随源', async () => {
    const source = ref<string | null>(null)
    const { frame } = useLastFrame(source)
    expect(frame.value).toBeNull()
    source.value = 'a'
    await Promise.resolve()
    expect(frame.value).toBe('a')
  })

  it('源转 null 后 frame 仍返回最后非空帧', async () => {
    const source = ref<string | null>(null)
    const { frame } = useLastFrame(source)
    source.value = 'a'
    await Promise.resolve()
    source.value = 'b'
    await Promise.resolve()
    source.value = null
    await Promise.resolve()
    expect(frame.value).toBe('b')
  })

  it('clear 后回落 null（清空时机由调用方控制）', async () => {
    const source = ref<string | null>(null)
    const { frame, clear } = useLastFrame(source)
    source.value = 'a'
    await Promise.resolve()
    source.value = null
    await Promise.resolve()
    expect(frame.value).toBe('a')
    clear()
    expect(frame.value).toBeNull()
  })

  it('immediate：初始即非空的源首帧入缓存', () => {
    const source = ref<string | null>('init')
    const { frame } = useLastFrame(source)
    expect(frame.value).toBe('init')
    source.value = null
    // watch immediate 已把 'init' 存入 lastFrame，源转 null 后仍命中
    return Promise.resolve().then(() => {
      expect(frame.value).toBe('init')
    })
  })
})
