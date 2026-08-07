import { computed, onScopeDispose, ref, watch } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import type { ExtractSpecsResult } from '../core/spec-detector'
import type { CxSpec } from '../cx'

/**
 * useCxPendingExit — 围栏闭合瞬间的延迟接管 + settle 独占
 *
 * spec-detector 在围栏闭合的同一帧把 pending-slot 翻成 widget-slot;若直接渲染,
 * pending 打字机文案会被硬切闪没。本 composable 检出「pending 1→0 且 specs 增长」
 * 的闭合帧,把新 widget-slot 占位还原为 pending-slot,让 pending-node 有机会逐字
 * 删除退出;markExitDone(pending-node 删除动画完成回调)后才真正翻牌。
 *
 * 翻牌后再给卡片 settleMs 的独占可见窗口:冻结 widget-slot 之后的 afterText
 * 不进 markstream(卡片不被顶出视口);finished 信号(消息完成/停止)立即释放,
 * 定时器到期自然释放。
 *
 * 单 pending 事实:未闭合围栏只能是全文末块(文本线性生长),pendingSources 恒 ≤1,
 * 故闭合的 pending 其 data-pending-index 恒为 0,新闭合 spec 恒为 specs 末位。
 *
 * 已知边界:单 chunk 同时闭合旧围栏并开启新围栏时(闭合+新 pending 同帧),
 * 旧 pending 不做退出动画直接翻牌——双 pending-slot 同 index 会撞车,且 SSE
 * 实践中该帧形概率极低,不为此引入双槽位退出态。
 */

/** 卡片翻牌后独占可见的冻结时长(ms):spec 闭合翻卡片后冻结后续文本 */
export const CX_SETTLE_MS = 2000

export interface CxPendingExit {
  /** 退出/settle 期间加工后的占位文本;无接管态时直通 */
  content: ComputedRef<string>
  /**
   * 退出期间冻结为闭合帧的 pendingSources;无退出态时直通。
   * 闭合即清空会让 pending-node 的增量树帧源断供、组件树退化为骨架——
   * 退出窗口内增量区应保持「widget 预览」语义,随翻牌一次性让位。
   */
  pendingSources: ComputedRef<string[]>
  /** 正在退出的 pending index;null = 无退出态 */
  exitingIndex: Ref<number | null>
  /** pending-node 退出动画完成回调:翻牌 widget 并清除退出态 */
  markExitDone: () => void
}

export interface CxPendingExitOptions {
  /** 消息完成/停止信号:置 true 立即释放 settle 冻结 */
  finished?: Ref<boolean>
  /** settle 冻结时长覆盖(ms),默认 CX_SETTLE_MS */
  settleMs?: number
}

export function useCxPendingExit(
  extraction: ComputedRef<ExtractSpecsResult<CxSpec>>,
  options?: CxPendingExitOptions,
): CxPendingExit {
  const exitingIndex = ref<number | null>(null)
  /** 接管中的 widget 占位索引(= 闭合帧 specs.length - 1),退出态期间恒有值 */
  const heldWidgetIndex = ref<number | null>(null)
  /** 闭合帧的 pendingSources 快照,退出态期间冻结供增量渲染续帧 */
  const frozenSources = ref<string[]>([])
  /** settle 冻结中:翻牌后冻结 afterText(到定时器释放或 finished 立即释放) */
  const settling = ref(false)
  let settleTimer: ReturnType<typeof setTimeout> | null = null

  function clearSettleTimer(): void {
    if (settleTimer !== null) {
      clearTimeout(settleTimer)
      settleTimer = null
    }
  }

  function releaseSettle(): void {
    clearSettleTimer()
    settling.value = false
  }

  watch(extraction, (curr, prev) => {
    const hadPending = (prev?.pendingSources?.length ?? 0) > 0
    const hasPending = (curr.pendingSources?.length ?? 0) > 0
    const specGrew = curr.specs.length > (prev?.specs.length ?? 0)
    if (hadPending && !hasPending && specGrew) {
      frozenSources.value = prev?.pendingSources ?? []
      exitingIndex.value = 0
      heldWidgetIndex.value = curr.specs.length - 1
    }
  })

  // finished(消息完成/停止)立即释放冻结:用户停止即交还全部内容
  if (options?.finished) {
    watch(options.finished, (done) => {
      if (done) releaseSettle()
    })
  }

  onScopeDispose(releaseSettle)

  /** 冻结 widget-slot 之后的文本(闭合标签后的内容不渲染) */
  function trimAfterWidgetSlots(text: string): string {
    let lastEnd = -1
    const re = /<\/widget-slot>/g
    let m: RegExpExecArray | null
    while ((m = re.exec(text)) !== null) {
      lastEnd = m.index + m[0].length
    }
    return lastEnd >= 0 ? text.slice(0, lastEnd) : text
  }

  const content = computed(() => {
    const raw = extraction.value.content ?? ''
    let out = raw
    if (exitingIndex.value !== null && heldWidgetIndex.value !== null) {
      const re = new RegExp(
        `<widget-slot[^>]*data-spec-array-index="${heldWidgetIndex.value}"[^>]*></widget-slot>`,
      )
      const pendingSlot = `<pending-slot data-spec-index="INDEX_PLACEHOLDER" data-pending-index="${exitingIndex.value}"></pending-slot>`
      out = out.replace(re, pendingSlot)
    }
    if (settling.value) {
      out = trimAfterWidgetSlots(out)
    }
    return out
  })

  const pendingSources = computed(() =>
    exitingIndex.value !== null ? frozenSources.value : (extraction.value.pendingSources ?? []),
  )

  function markExitDone() {
    exitingIndex.value = null
    heldWidgetIndex.value = null
    frozenSources.value = []
    // 翻牌为 widget 后启动 settle 独占窗口(finished 已达成则不冻结)
    if (!options?.finished?.value) {
      clearSettleTimer()
      settling.value = true
      settleTimer = setTimeout(releaseSettle, options?.settleMs ?? CX_SETTLE_MS)
    }
  }

  return { content, pendingSources, exitingIndex, markExitDone }
}
