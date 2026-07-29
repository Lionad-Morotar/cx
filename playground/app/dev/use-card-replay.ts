import { computed, getCurrentInstance, onUnmounted, ref } from 'vue'
import {
  createIncrementalExtractor,
  matchCxTrigger,
  type CxSpec,
  type CxStreamNode,
  type TriggerRegistry,
} from '@lionad/cx-stream'

// /dev/components* 验收页卡片回放的引擎：把卡片自身的节点序列化成一根
// 不断生长的 JSON，按 40 tokens/秒 喂给增量管线，复现真实 LLM 流式输出时
// 「从 0 逐项长出来」的渲染过程。与 /dev/stream 的回放引擎同构但单组件、
// 无围栏——extractor 对纯 JSON 直送同样成立（不经 detector）。

/** 回放速度（tokens/秒）。token 与字符的换算取粗近似，见 CHARS_PER_TOKEN */
export const REPLAY_TOKENS_PER_SEC = 40

/**
 * 每 token 平均字符数（粗近似）：JSON 语法 ASCII 约 4 chars/token，
 * 中文数据约 1.5 chars/token，混合剧本加权取 3。回放节奏为演示体感，
 * 非精确计量——40 × 3 = 120 chars/秒 与 /dev/stream 默认速度同档。
 */
const CHARS_PER_TOKEN = 3

export const REPLAY_CHARS_PER_SEC = REPLAY_TOKENS_PER_SEC * CHARS_PER_TOKEN

const TICK_MS = 50

/** 每拍推进的字符数：120 chars/秒 × 50ms = 6 */
const CHARS_PER_TICK = (REPLAY_CHARS_PER_SEC * TICK_MS) / 1000

export type ReplayPhase = 'idle' | 'playing' | 'done'

/** 剧本源节点的最小形状（卡片 toItem 产物 CxComponentRuntime 的子集） */
export interface ReplaySourceNode {
  id?: string
  key: string
  data?: Record<string, unknown>
  components?: unknown
}

/**
 * 把卡片节点装配为回放剧本：只保留 cx 最小契约（id/key/data/components），
 * 剥除运行时冗余字段（aliasKeys/props/emits/exposes/parents/name——
 * 由 cx-render 从组件元信息自动补全，不进 LLM 输出契约）。
 * pretty-print 使前缀播放有逐行生长的观感；空 components 对象一并剥除。
 */
export function replayScriptOf(node: ReplaySourceNode): string {
  const script: CxStreamNode = {
    id: node.id ?? `replay-${node.key}`,
    key: node.key,
  }
  if (node.data !== undefined) script.data = node.data
  const comps = node.components as Record<string, CxStreamNode[]> | undefined
  if (comps && typeof comps === 'object' && Object.keys(comps).length > 0) {
    script.components = comps
  }
  return JSON.stringify(script, null, 2)
}

export interface UseCardReplayOptions {
  /** 卡片所属物料库的 trigger 注册表（空注册表即无 trigger 判定，走一次性渲染） */
  registry: TriggerRegistry<CxSpec>
  /** 增量节点主数组计数（徽标展示用）；库未提供 mainArrayOf 时省略 */
  countOf?: (node: CxStreamNode) => number | null
}

/**
 * 单卡片流式回放状态机：idle →（play）→ playing →（播完）→ done →（toggle）→ 重播。
 * playing 期间 partial 为当前可渲染的部分节点（无 trigger 组件恒 null，
 * 页面据此展示「等待首个完整条目」）；sawPartial 标记全程是否出现过增量帧，
 * done 时供页面对无 trigger 组件展示「一次性渲染」说明。
 */
export function useCardReplay(node: ReplaySourceNode, options: UseCardReplayOptions) {
  const script = replayScriptOf(node)
  const extractor = createIncrementalExtractor<CxSpec>({
    registry: options.registry,
    matchTrigger: matchCxTrigger,
  })

  // 物料是否具备流式语义（增量 trigger）：页面据此门控回放按钮——无 trigger
  // 的组件播放全程无增量帧，回放无演示价值。key 与注册表同一条契约链
  // （matchCxTrigger 按 node.key 匹配），与 extractor 行为同源。
  const hasTrigger = options.registry.has(node.key)

  const phase = ref<ReplayPhase>('idle')
  const partial = ref<CxStreamNode | null>(null)
  const sawPartial = ref(false)

  let timer: ReturnType<typeof setInterval> | null = null
  let offset = 0

  function stopTimer() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  function finish() {
    stopTimer()
    phase.value = 'done'
  }

  function play() {
    reset()
    phase.value = 'playing'
    timer = setInterval(() => {
      offset = Math.min(offset + CHARS_PER_TICK, script.length)
      const frame = extractor.next(script.slice(0, offset)) as CxStreamNode | null
      if (frame) {
        partial.value = frame
        sawPartial.value = true
      }
      if (offset >= script.length) finish()
    }, TICK_MS)
  }

  function reset() {
    stopTimer()
    extractor.reset()
    offset = 0
    partial.value = null
    sawPartial.value = false
    phase.value = 'idle'
  }

  /** idle → 播放；playing → 中止复位；done → 从头重播 */
  function toggle() {
    if (phase.value === 'playing') {
      reset()
    } else {
      play()
    }
  }

  // 页面卸载兜底停表；无头测试在组件实例外调用时跳过注册
  if (getCurrentInstance()) onUnmounted(reset)

  /** 当前增量帧主数组计数（徽标展示）；帧缺席或库未提供 countOf 时为 null */
  const partialCount = computed(() => {
    const node = partial.value
    return node ? (options.countOf?.(node) ?? null) : null
  })

  /**
   * 卡片 footer 说明文案：仅播完且全程无增量帧时出现——无增量 trigger 的
   * 物料流式期间无可展示中间态，完整 JSON 闭合后一次性渲染，向用户说明
   * 这不是卡住。playing/idle 或有增量帧时为 null。
   */
  const doneNote = computed(() =>
    phase.value === 'done' && !sawPartial.value
      ? '无增量 trigger，围栏闭合一次性渲染'
      : null,
  )

  return { phase, partial, partialCount, sawPartial, hasTrigger, doneNote, play, reset, toggle }
}

export type CardReplay = ReturnType<typeof useCardReplay>

/** 卡片回放按钮图标：▶ 播放 / ■ 中止 / ↻ 重播 */
export function replayIcon(replay: CardReplay): string {
  switch (replay.phase.value) {
    case 'playing':
      return '■'
    case 'done':
      return '↻'
    default:
      return '▶'
  }
}

/** 卡片回放按钮提示文案 */
export function replayTitle(replay: CardReplay): string {
  switch (replay.phase.value) {
    case 'playing':
      return '停止回放'
    case 'done':
      return `重播（${REPLAY_TOKENS_PER_SEC} tokens/秒）`
    default:
      return `流式回放（${REPLAY_TOKENS_PER_SEC} tokens/秒）`
  }
}
