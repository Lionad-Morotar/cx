import { describe, expect, it, vi } from 'vitest'
import { computed, ref } from 'vue'
import { useCxPendingExit, CX_SETTLE_MS } from '../src/vue/useCxPendingExit'
import type { ExtractSpecsResult } from '../src/core/spec-detector'
import type { CxSpec } from '../src/cx'

/**
 * useCxPendingExit — 围栏闭合瞬间的「延迟接管」契约
 *
 * 闭合即替换会让 pending 打字机文案硬切消失(闪);本 composable 在闭合后把
 * 新出现的 widget-slot 占位还原为 pending-slot,给 pending-node 一个逐字删除
 * 的退出窗口,markExitDone 回调后才真正翻牌为 widget;翻牌后 settle 冻结
 * afterText 独占可见窗口(默认 CX_SETTLE_MS,可经 settleMs 覆盖,finished 立即释放)。
 */

const SPEC: CxSpec = { key: 'cx-vtu-article', data: { title: '你好' } }

function extraction(
  content: string,
  specs: CxSpec[] = [],
  pendingSources?: string[],
): ExtractSpecsResult<CxSpec> {
  return { status: pendingSources?.length ? 'pending' : 'success', specs, content, pendingSources }
}

describe('useCxPendingExit', () => {
  it('无 pending 时 content 直通、无退出态', () => {
    const source = ref(extraction('前置文本'))
    const { content, exitingIndex } = useCxPendingExit(computed(() => source.value))
    expect(content.value).toBe('前置文本')
    expect(exitingIndex.value).toBeNull()
  })

  it('status none(无围栏纯文本)content 直通 undefined,不截胡消费方的 ?? 原文回退', () => {
    // 真实 detector 对无围栏文本返回 { status:'none', specs:[] }(content 缺省);
    // 归零空串会让消费方 `content ?? 原文` 回退失效,纯文本回复渲染空白
    const source = ref<ExtractSpecsResult<CxSpec>>({ status: 'none', specs: [] })
    const { content, exitingIndex } = useCxPendingExit(computed(() => source.value))
    expect(content.value).toBeUndefined()
    expect(exitingIndex.value).toBeNull()
  })

  it('pending 生长期间 content 直通,不进入退出态', async () => {
    const source = ref(
      extraction(
        '文本\n<pending-slot data-spec-index="INDEX_PLACEHOLDER" data-pending-index="0"></pending-slot>',
        [],
        ['{ "key": "cx-vtu-art'],
      ),
    )
    const { content, exitingIndex } = useCxPendingExit(computed(() => source.value))
    source.value = extraction(
      '文本\n<pending-slot data-spec-index="INDEX_PLACEHOLDER" data-pending-index="0"></pending-slot>',
      [],
      ['{ "key": "cx-vtu-article"'],
    )
    await Promise.resolve()
    expect(exitingIndex.value).toBeNull()
    expect(content.value).toContain('data-pending-index="0"')
  })

  it('pending 闭合翻 success 时,新 widget-slot 被还原为 pending-slot 并进入退出态', async () => {
    const widgetText =
      '<widget-slot data-spec-index="INDEX_PLACEHOLDER" data-spec-key="cx-vtu-article" data-spec-array-index="0"></widget-slot>'
    const source = ref(
      extraction(
        '前文\n<pending-slot data-spec-index="INDEX_PLACEHOLDER" data-pending-index="0"></pending-slot>',
        [],
        ['{ "key": "cx-vtu-article", "data": { "title": "你好" } }'],
      ),
    )
    const { content, exitingIndex } = useCxPendingExit(computed(() => source.value))

    source.value = extraction(`前文\n${widgetText}`, [SPEC])
    await Promise.resolve()

    expect(exitingIndex.value).toBe(0)
    expect(content.value).not.toContain('widget-slot')
    expect(content.value).toContain('pending-slot')
    expect(content.value).toContain('data-pending-index="0"')
  })

  it('闭合后后续文本继续生长,还原仍生效且新文本保留', async () => {
    const widgetText =
      '<widget-slot data-spec-index="INDEX_PLACEHOLDER" data-spec-array-index="0"></widget-slot>'
    const source = ref(
      extraction(
        '前文\n<pending-slot data-spec-index="INDEX_PLACEHOLDER" data-pending-index="0"></pending-slot>',
        [],
        ['{}'],
      ),
    )
    const { content, exitingIndex } = useCxPendingExit(computed(() => source.value))

    source.value = extraction(`前文\n${widgetText}`, [SPEC])
    await Promise.resolve()
    source.value = extraction(`前文\n${widgetText}\n后续段落继续流出`, [SPEC])
    await Promise.resolve()

    expect(exitingIndex.value).toBe(0)
    expect(content.value).toContain('pending-slot')
    expect(content.value).toContain('后续段落继续流出')
  })

  it('markExitDone 后恢复 widget 接管,退出态清除', async () => {
    const widgetText =
      '<widget-slot data-spec-index="INDEX_PLACEHOLDER" data-spec-array-index="0"></widget-slot>'
    const source = ref(
      extraction(
        '前文\n<pending-slot data-spec-index="INDEX_PLACEHOLDER" data-pending-index="0"></pending-slot>',
        [],
        ['{}'],
      ),
    )
    const { content, exitingIndex, markExitDone } = useCxPendingExit(computed(() => source.value))

    source.value = extraction(`前文\n${widgetText}`, [SPEC])
    await Promise.resolve()
    expect(exitingIndex.value).toBe(0)

    markExitDone()
    expect(exitingIndex.value).toBeNull()
    expect(content.value).toBe(`前文\n${widgetText}`)
  })

  it('退出窗口内 pendingSources 冻结为闭合帧,翻牌后恢复直通', async () => {
    const widgetText =
      '<widget-slot data-spec-index="INDEX_PLACEHOLDER" data-spec-array-index="0"></widget-slot>'
    const pendingRaw = '{ "key": "cx-vtu-article", "data": { "title": "你好" } }'
    const source = ref(
      extraction(
        '前文\n<pending-slot data-spec-index="INDEX_PLACEHOLDER" data-pending-index="0"></pending-slot>',
        [],
        [pendingRaw],
      ),
    )
    const { pendingSources, markExitDone } = useCxPendingExit(computed(() => source.value))
    expect(pendingSources.value).toEqual([pendingRaw])

    source.value = extraction(`前文\n${widgetText}`, [SPEC])
    await Promise.resolve()
    // 闭合后 extraction 已无 pending,但退出窗口内帧源冻结(增量树保持 widget 预览)
    expect(pendingSources.value).toEqual([pendingRaw])

    markExitDone()
    expect(pendingSources.value).toEqual([])
  })

  it('裸 JSON 闭合(无 pending 阶段)不进入退出态', async () => {
    const widgetText =
      '<widget-slot data-spec-index="INDEX_PLACEHOLDER" data-spec-array-index="0"></widget-slot>'
    const source = ref(extraction('纯文本无围栏'))
    const { content, exitingIndex } = useCxPendingExit(computed(() => source.value))

    source.value = extraction(`纯文本\n${widgetText}`, [SPEC])
    await Promise.resolve()

    expect(exitingIndex.value).toBeNull()
    expect(content.value).toBe(`纯文本\n${widgetText}`)
  })

  // ─── settle 独占窗口(翻牌后冻结 afterText,finished/到期释放)───

  it('markExitDone 翻牌后 settle 冻结 afterText,CX_SETTLE_MS 到期释放', async () => {
    vi.useFakeTimers()
    try {
      const widgetText =
        '<widget-slot data-spec-index="INDEX_PLACEHOLDER" data-spec-array-index="0"></widget-slot>'
      const source = ref(
        extraction(
          '前文\n<pending-slot data-spec-index="INDEX_PLACEHOLDER" data-pending-index="0"></pending-slot>',
          [],
          ['{}'],
        ),
      )
      const finished = ref(false)
      const { content, markExitDone } = useCxPendingExit(computed(() => source.value), {
        finished,
      })

      source.value = extraction(`前文\n${widgetText}\n后续段落A`, [SPEC])
      await Promise.resolve()
      markExitDone()
      // settle 冻结:afterText 不进渲染
      expect(content.value).toBe(`前文\n${widgetText}`)
      // 冻结期间 afterText 继续增长仍被截断
      source.value = extraction(`前文\n${widgetText}\n后续段落A\n后续段落B`, [SPEC])
      await Promise.resolve()
      expect(content.value).toBe(`前文\n${widgetText}`)
      // 到期自然释放
      vi.advanceTimersByTime(CX_SETTLE_MS)
      await Promise.resolve()
      expect(content.value).toBe(`前文\n${widgetText}\n后续段落A\n后续段落B`)
    } finally {
      vi.useRealTimers()
    }
  })

  it('settle 冻结只砍成片文本,后续 pending-slot(生成中信号)保留', async () => {
    vi.useFakeTimers()
    try {
      const widgetText =
        '<widget-slot data-spec-index="INDEX_PLACEHOLDER" data-spec-array-index="0"></widget-slot>'
      const pendingSlot =
        '<pending-slot data-spec-index="INDEX_PLACEHOLDER" data-pending-index="0"></pending-slot>'
      const source = ref(extraction(`前文\n${pendingSlot}`, [], ['{}']))
      const { content, markExitDone } = useCxPendingExit(computed(() => source.value))

      source.value = extraction(`前文\n${widgetText}\n中段文本`, [SPEC])
      await Promise.resolve()
      markExitDone()
      expect(content.value).toBe(`前文\n${widgetText}`)

      // settle 期间新围栏开始传输:未闭合围栏恒为全文末块(单 pending 事实),
      // pending-slot 是生成中信号(打字机/增量渲染的占位),随翻牌卡片一起保留;
      // 其前的成片中段文本仍被砍(卡片独占语义不变)
      source.value = extraction(`前文\n${widgetText}\n中段文本\n${pendingSlot}`, [SPEC], ['{"key":'])
      await Promise.resolve()
      // 拼接处补段落分隔(markdown 块语义),pending-slot 前成片文本砍除
      expect(content.value).toBe(`前文\n${widgetText}\n\n${pendingSlot}`)

      // 到期释放后全量呈现
      vi.advanceTimersByTime(CX_SETTLE_MS)
      await Promise.resolve()
      expect(content.value).toBe(`前文\n${widgetText}\n中段文本\n${pendingSlot}`)
    } finally {
      vi.useRealTimers()
    }
  })

  it('settleMs 覆盖默认冻结时长', async () => {
    vi.useFakeTimers()
    try {
      const widgetText =
        '<widget-slot data-spec-index="INDEX_PLACEHOLDER" data-spec-array-index="0"></widget-slot>'
      const source = ref(
        extraction(
          '前文\n<pending-slot data-spec-index="INDEX_PLACEHOLDER" data-pending-index="0"></pending-slot>',
          [],
          ['{}'],
        ),
      )
      const { content, markExitDone } = useCxPendingExit(computed(() => source.value), {
        settleMs: 500,
      })

      source.value = extraction(`前文\n${widgetText}\n后续段落`, [SPEC])
      await Promise.resolve()
      markExitDone()
      expect(content.value).toBe(`前文\n${widgetText}`)
      // 500ms 提前于默认 2000ms 释放
      vi.advanceTimersByTime(500)
      await Promise.resolve()
      expect(content.value).toBe(`前文\n${widgetText}\n后续段落`)
    } finally {
      vi.useRealTimers()
    }
  })

  it('finished 信号立即释放 settle 冻结', async () => {
    vi.useFakeTimers()
    try {
      const widgetText =
        '<widget-slot data-spec-index="INDEX_PLACEHOLDER" data-spec-array-index="0"></widget-slot>'
      const source = ref(
        extraction(
          '前文\n<pending-slot data-spec-index="INDEX_PLACEHOLDER" data-pending-index="0"></pending-slot>',
          [],
          ['{}'],
        ),
      )
      const finished = ref(false)
      const { content, markExitDone } = useCxPendingExit(computed(() => source.value), {
        finished,
      })

      source.value = extraction(`前文\n${widgetText}\n后续段落`, [SPEC])
      await Promise.resolve()
      markExitDone()
      expect(content.value).toBe(`前文\n${widgetText}`)
      // finished 立即释放,不等到期
      finished.value = true
      await Promise.resolve()
      expect(content.value).toBe(`前文\n${widgetText}\n后续段落`)
    } finally {
      vi.useRealTimers()
    }
  })

  it('finished 已达成时 markExitDone 不启动 settle', async () => {
    const widgetText =
      '<widget-slot data-spec-index="INDEX_PLACEHOLDER" data-spec-array-index="0"></widget-slot>'
    const source = ref(
      extraction(
        '前文\n<pending-slot data-spec-index="INDEX_PLACEHOLDER" data-pending-index="0"></pending-slot>',
        [],
        ['{}'],
      ),
    )
    const finished = ref(true)
    const { content, markExitDone } = useCxPendingExit(computed(() => source.value), {
      finished,
    })

    source.value = extraction(`前文\n${widgetText}\n后续段落`, [SPEC])
    await Promise.resolve()
    markExitDone()
    expect(content.value).toBe(`前文\n${widgetText}\n后续段落`)
  })
})
