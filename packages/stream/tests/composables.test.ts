import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, defineComponent, h, nextTick, ref } from 'vue'
import type { Ref } from 'vue'
import { createTriggerRegistry } from '../src/core/incremental'
import { cxHumanTextConfig } from '../src/cx'
import { useIncrementalTree } from '../src/vue/useIncrementalTree'
import { usePendingTypewriter } from '../src/vue/usePendingTypewriter'
import { useStreamChunks } from '../src/vue/useStreamChunks'

import type { IncrementalTrigger } from '../src/core/incremental'
import type { CxSpec, CxStreamNode } from '../src/cx'

// --- useStreamChunks ---

describe('useStreamChunks', () => {
  const separator = { marker: '\n\n---\n\n', offset: '\n\n---\n\n'.length }

  it('空 strategies 返回单个未完成 chunk', async () => {
    const content = ref('hello world')
    const { chunks } = useStreamChunks(content, [])
    await nextTick()
    expect(chunks.value).toEqual([{ content: 'hello world', isComplete: false }])
  })

  it('单策略正确分割', async () => {
    const content = ref('part1\n\n---\n\npart2\n\n---\n\npart3')
    const { chunks } = useStreamChunks(content, [separator])
    await nextTick()
    expect(chunks.value).toHaveLength(3)
    expect(chunks.value[0]).toEqual({ content: 'part1', isComplete: true })
    expect(chunks.value[1]).toEqual({ content: 'part2', isComplete: true })
    expect(chunks.value[2]).toEqual({ content: 'part3', isComplete: false })
  })

  it('多策略重叠按位置排序并过滤', async () => {
    const content = ref('A\n\n---\n\nB\n## C')
    const { chunks } = useStreamChunks(content, [separator, { marker: '\n## ', offset: 2 }])
    await nextTick()
    expect(chunks.value).toHaveLength(3)
    expect(chunks.value[2]).toEqual({ content: '# C', isComplete: false })
  })

  it('内容增长时对新完整块触发回调', async () => {
    const content = ref('first')
    const onChunkDetected = vi.fn()
    useStreamChunks(content, [separator], onChunkDetected)
    await nextTick()
    expect(onChunkDetected).not.toHaveBeenCalled()

    content.value = 'first\n\n---\n\nsecond'
    await nextTick()
    expect(onChunkDetected).toHaveBeenCalledTimes(1)
    expect(onChunkDetected).toHaveBeenCalledWith('first', 0)
  })

  it('流结束（ended）后尾块从生长中转为完整块', async () => {
    const content = ref('part1\n\n---\n\npart2')
    const ended = ref(false)
    const { chunks } = useStreamChunks(content, [separator], { ended })
    await nextTick()
    expect(chunks.value[1]).toEqual({ content: 'part2', isComplete: false })

    ended.value = true
    await nextTick()
    expect(chunks.value[1]).toEqual({ content: 'part2', isComplete: true })
  })

  it('ended 时为非空尾块补发 onChunkDetected 回调', async () => {
    const content = ref('first\n\n---\n\nsecond')
    const ended = ref(false)
    const onChunkDetected = vi.fn()
    useStreamChunks(content, [separator], { onChunkDetected, ended })
    await nextTick()
    expect(onChunkDetected).toHaveBeenCalledTimes(1)
    expect(onChunkDetected).toHaveBeenLastCalledWith('first', 0)

    ended.value = true
    await nextTick()
    expect(onChunkDetected).toHaveBeenCalledTimes(2)
    expect(onChunkDetected).toHaveBeenLastCalledWith('second', 1)
  })

  it('内容恰以分隔符结尾时 ended 不补发空尾块回调', async () => {
    const content = ref('first\n\n---\n\n')
    const onChunkDetected = vi.fn()
    useStreamChunks(content, [separator], { onChunkDetected, ended: ref(true) })
    await nextTick()
    expect(onChunkDetected).toHaveBeenCalledTimes(1)
    expect(onChunkDetected).toHaveBeenLastCalledWith('first', 0)
  })
})

// --- useIncrementalTree ---

const tableTrigger: IncrementalTrigger<CxSpec> = {
  scanPaths: [
    ['data', 'columns', '*'],
    ['data', 'rows', '*'],
  ],
  buildPartial(spec) {
    if (Array.isArray(spec)) return null
    const data = (spec.data ?? {}) as Record<string, unknown>
    const columns = Array.isArray(data.columns) ? data.columns : []
    if (columns.length === 0) return null
    return {
      ...spec,
      data: {
        ...data,
        columns: [...columns],
        rows: Array.isArray(data.rows) ? [...data.rows] : [],
      },
    }
  },
}

describe('useIncrementalTree', () => {
  it('sourceText 增长 → partialSpec 响应式更新', async () => {
    const source = ref('{"id":"t1","key":"cx-demo-table","data":{"columns":[{"key":"name"}')
    const registry = createTriggerRegistry<CxSpec>()
    registry.register('cx-demo-table', tableTrigger)
    const { partialSpec } = useIncrementalTree(
      computed(() => source.value),
      {
        registry,
        matchTrigger: (spec, reg) => {
          const node = Array.isArray(spec) ? spec[0] : spec
          const t = node ? reg.get(node.key) : undefined
          return t ? [node.key, t] : null
        },
      },
    )

    expect((partialSpec.value as CxStreamNode).data!.columns).toHaveLength(1)

    source.value += '],"rows":[{"name":"磨床"}'
    await nextTick()
    const node = partialSpec.value as CxStreamNode
    expect(node.data!.columns).toHaveLength(1)
    expect(node.data!.rows).toHaveLength(1)
  })

  it('无匹配 / trigger 未命中的 delta 保持上次有效结果（不闪没）', async () => {
    const good = '{"id":"t1","key":"cx-demo-table","data":{"columns":[{"key":"name"}'
    const source = ref(good)
    const registry = createTriggerRegistry<CxSpec>()
    registry.register('cx-demo-table', tableTrigger)
    const { partialSpec } = useIncrementalTree(
      computed(() => source.value),
      {
        registry,
        matchTrigger: (spec, reg) => {
          const node = Array.isArray(spec) ? spec[0] : spec
          const t = node ? reg.get(node.key) : undefined
          return t ? [node.key, t] : null
        },
      },
    )

    const before = partialSpec.value
    expect(before).not.toBeNull()

    // 分支 1：扫描无任何平衡匹配（下一个行对象未闭合）→ 同引用返回 lastValid
    source.value = '{"id":"t1","key":"cx-demo-table","data":{"rows":[{"na'
    await nextTick()
    expect(partialSpec.value).toBe(before)

    // 分支 2：有匹配但解析结果的 key 未注册 → 同引用返回 lastValid
    source.value = '{"key":"unregistered","data":{"columns":[{"k":1}]}'
    await nextTick()
    expect(partialSpec.value).toBe(before)
  })
})

// --- usePendingTypewriter ---

describe('usePendingTypewriter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function mountTypewriter(
    sourceText: Ref<string>,
    options: Parameters<typeof usePendingTypewriter>[1] = {},
  ) {
    let api!: ReturnType<typeof usePendingTypewriter>
    const wrapper = mount(
      defineComponent({
        setup() {
          api = usePendingTypewriter(
            computed(() => sourceText.value),
            {
              typingSpeed: 10,
              deletingSpeed: 5,
              waitPeriod: 100,
              humanText: cxHumanTextConfig,
              funify: (t) => t, // 测试中关闭随机装饰
              ...options,
            },
          )
          return () => h('div', api.displayText.value)
        },
      }),
    )
    return { wrapper, api }
  }

  it('挂载后逐字打出提取的文本', () => {
    const source = ref('{"key":"cx-text","data":{"text":"查询结果"}}')
    const { api } = mountTypewriter(source)

    // 初始 1s 等待（loading 态）
    vi.advanceTimersByTime(1000)
    expect(api.displayText.value.length).toBeGreaterThan(0)

    // 打完全部 4 个字（4 × 10ms）
    vi.advanceTimersByTime(100)
    expect(api.displayText.value).toBe('查询结果')
  })

  it('提取不到结构化文本时回退 markdown 句子', () => {
    const source = ref('正在为您处理。请稍候。')
    const { api } = mountTypewriter(source)

    vi.advanceTimersByTime(1000 + 200)
    expect(api.displayText.value).toBe('请稍候。')
  })

  it('stateKey 跨实例共享状态（抵抗组件重建）', () => {
    const source = ref('{"key":"cx-text","data":{"text":"共享文本"}}')

    // 实例 A 完整打完
    const a = mountTypewriter(source, { stateKey: 'msg-1:0' })
    vi.advanceTimersByTime(1000 + 200)
    expect(a.api.displayText.value).toBe('共享文本')

    // 实例 B 同 key 挂载：直接恢复已打完状态，无需重新打字
    const b = mountTypewriter(source, { stateKey: 'msg-1:0' })
    expect(b.api.displayText.value).toBe('共享文本')

    a.wrapper.unmount()
    b.wrapper.unmount()
  })

  it('同 stateKey 双实例并存：卸载其一,存活实例动画继续（驱动权移交）', () => {
    const source = ref('{"key":"cx-text","data":{"text":"共享文本"}}')
    const a = mountTypewriter(source, { stateKey: 'handover:0' })
    const b = mountTypewriter(source, { stateKey: 'handover:0' })

    vi.advanceTimersByTime(1000 + 200)
    expect(a.api.displayText.value).toBe('共享文本')
    expect(b.api.displayText.value).toBe('共享文本')

    // 卸载 a：驱动权应移交给 b,而非杀死共享动画链
    a.wrapper.unmount()

    // 切换源文本并推进多个周期:b 应提取并打出新文本
    source.value = '{"key":"cx-text","data":{"text":"全新内容"}}'
    vi.advanceTimersByTime(5000)
    expect(b.api.displayText.value).toBe('全新内容')

    b.wrapper.unmount()
  })

  it('无 stateKey 时实例私有', () => {
    const source = ref('{"key":"cx-text","data":{"text":"私有文本"}}')
    const a = mountTypewriter(source)
    vi.advanceTimersByTime(1000 + 200)
    expect(a.api.displayText.value).toBe('私有文本')

    // 第二个实例从头开始打（未共享）
    const b = mountTypewriter(source)
    expect(b.api.displayText.value).toBe('')

    a.wrapper.unmount()
    b.wrapper.unmount()
  })

  it('exit 执行逐字删除动画', () => {
    const source = ref('{"key":"cx-text","data":{"text":"删除测试"}}')
    const { wrapper, api } = mountTypewriter(source)

    vi.advanceTimersByTime(1000 + 200)
    expect(api.displayText.value).toBe('删除测试')

    const onDone = vi.fn()
    api.exit(onDone)
    vi.advanceTimersByTime(4 * 5 + 10) // 4 字 × deletingSpeed
    expect(api.displayText.value).toBe('')
    expect(onDone).toHaveBeenCalledTimes(1)

    wrapper.unmount()
  })

  it('极小 waitPeriod + 短句不产生热定时器循环', () => {
    const source = ref('{"key":"cx-text","data":{"text":"短句"}}')
    const { wrapper, api } = mountTypewriter(source, { waitPeriod: 1 })

    vi.advanceTimersByTime(1000 + 50)
    expect(api.displayText.value).toBe('短句')

    // 推进 10s：若周期未兜底（负值→0），loop 会空转上万次；
    // 兜底 200ms 后最多约 50 次，且 displayText 保持稳定
    vi.advanceTimersByTime(10_000)
    expect(api.displayText.value).toBe('短句')

    wrapper.unmount()
  })

  it('卸载后定时器不再更新 displayText', () => {
    const source = ref('{"key":"cx-text","data":{"text":"守卫测试"}}')
    const { wrapper, api } = mountTypewriter(source)

    vi.advanceTimersByTime(1000 + 20) // 打了一半
    const mid = api.displayText.value
    wrapper.unmount()

    vi.advanceTimersByTime(10000)
    expect(api.displayText.value).toBe(mid)
  })
})
