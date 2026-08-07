import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import type { Ref } from 'vue'

import { useStreamReplay } from '../src/vue/useStreamReplay'

/**
 * useStreamReplay 行为契约：定时器按「字符/秒」推进，进度对齐到 chunk（SSE delta）
 * 边界；finish() 直推剧本末尾（大剧本验收/演示跳过逐帧等待）。
 * 双消费方 Fork 的统一上提：playground 版 speed=120 无 finish，宿主版 speed=2400
 * 有 finish——options.speed 参数化保持 playground 默认行为，finish 反哺全部消费方。
 */

function mountReplay(
  chunks: Ref<string[]>,
  options?: Parameters<typeof useStreamReplay>[1],
) {
  let api!: ReturnType<typeof useStreamReplay>
  const wrapper = mount(
    defineComponent({
      setup() {
        api = useStreamReplay(chunks, options)
        return () => h('div', api.streamText.value)
      },
    }),
  )
  return { wrapper, api }
}

const CHUNKS = ['{"key":"cx-text",\n', '"data":{"text":"hello"}}\n', '```tail```']

describe('useStreamReplay', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('零点归零：未播放时 progress 为 0、streamText 为空', () => {
    const { api } = mountReplay(ref(CHUNKS))
    expect(api.progress.value).toBe(0)
    expect(api.streamText.value).toBe('')
    expect(api.playing.value).toBe(false)
  })

  it('默认速度 120 字符/秒（playground 现状值）', () => {
    const { api } = mountReplay(ref(CHUNKS))
    expect(api.speed.value).toBe(120)
  })

  it('options.speed 覆盖初始速度', () => {
    const { api } = mountReplay(ref(CHUNKS), { speed: 2400 })
    expect(api.speed.value).toBe(2400)
  })

  it('播放按 chunk 边界推进：偏移进入 chunk 区间即整片送达', () => {
    // speed=200 → 每拍（TICK_MS=50）推进 10 字符；首拍落在 chunk1 区间内（10<17）
    const { api } = mountReplay(ref(CHUNKS), { speed: 200 })
    api.togglePlay()
    expect(api.playing.value).toBe(true)
    vi.advanceTimersByTime(50)
    expect(api.progress.value).toBe(1)
    expect(api.streamText.value).toBe(CHUNKS[0])
    // 第二拍偏移 20，越过 chunk1 起点（17）→ chunk1 整片送达
    vi.advanceTimersByTime(50)
    expect(api.progress.value).toBe(2)
    expect(api.streamText.value).toBe(CHUNKS[0] + CHUNKS[1])
  })

  it('pause 停表，进度保持', () => {
    const { api } = mountReplay(ref(CHUNKS), { speed: 200 })
    api.togglePlay()
    vi.advanceTimersByTime(50)
    api.togglePlay()
    expect(api.playing.value).toBe(false)
    const text = api.streamText.value
    vi.advanceTimersByTime(200)
    expect(api.streamText.value).toBe(text)
  })

  it('finish 直推剧本末尾：streamText 全文、progress 满、playing 停', () => {
    const { api } = mountReplay(ref(CHUNKS))
    api.togglePlay()
    api.finish()
    expect(api.streamText.value).toBe(CHUNKS.join(''))
    expect(api.progress.value).toBe(CHUNKS.length)
    expect(api.playing.value).toBe(false)
  })

  it('reset 停表归零', () => {
    const { api } = mountReplay(ref(CHUNKS))
    api.finish()
    api.reset()
    expect(api.progress.value).toBe(0)
    expect(api.streamText.value).toBe('')
  })

  it('剧本切换自动停表归零', async () => {
    const chunks = ref(CHUNKS)
    const { api } = mountReplay(chunks)
    api.finish()
    expect(api.progress.value).toBe(CHUNKS.length)
    chunks.value = ['"new":true']
    // watch 默认 flush:'pre' 异步批处理，等一拍让 reset 生效
    await nextTick()
    expect(api.progress.value).toBe(0)
    expect(api.streamText.value).toBe('')
  })

  it('播到结尾自动停表；再播放从头开始', () => {
    const { api } = mountReplay(ref(CHUNKS), { speed: 1e6 })
    api.togglePlay()
    vi.advanceTimersByTime(50)
    expect(api.playing.value).toBe(false)
    expect(api.streamText.value).toBe(CHUNKS.join(''))
    api.togglePlay()
    expect(api.playing.value).toBe(true)
    expect(api.streamText.value).toBe('')
  })
})
