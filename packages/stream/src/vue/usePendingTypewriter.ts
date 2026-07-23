import { computed, onMounted, onUnmounted, shallowReactive, toValue } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { extractDisplayText, funifyText } from '../core/human-text'
import type { HumanTextConfig } from '../core/human-text'

/**
 * 共享动画状态。
 *
 * 定时器链由单一 driver 实例驱动（避免多实例并存时争抢 cursor
 * 与互相覆盖定时器句柄）；driver 卸载时经 takeOver 回调把驱动权
 * 移交给下一个存活实例。状态为 shallowReactive，所有共享实例的
 * displayText 经 computed 自动同步，无需各自跑动画链。
 */
interface AnimState {
  sentence: string
  cursor: number
  /** 共享此状态的存活组件实例数 */
  refs: number
  /** 当前驱动动画链的实例 id；null = 无驱动者 */
  driver: symbol | null
  /** 非驱动实例登记的接管回调（驱动者卸载时调用） */
  takeOver: (() => void) | null
}

/** 模块级 store：按 stateKey 跨组件实例共享，抵抗宿主渲染器的组件重建 */
const store = new Map<string, AnimState>()

/** 存活实例登记：判定 driver 是否仍活着 */
const liveInstances = new Set<symbol>()

const DEFAULTS = {
  typingSpeed: 40,
  deletingSpeed: 25,
  waitPeriod: 2000,
  defaultText: '正在解析数据...',
}

export interface PendingTypewriterOptions {
  typingSpeed?: number
  deletingSpeed?: number
  waitPeriod?: number
  defaultText?: string
  /**
   * 跨实例状态持久化键（如 `${messageId}:${specIndex}`）。
   * 不传则状态为组件实例私有。
   */
  stateKey?: Ref<string> | ComputedRef<string> | string
  /** 人类文本提取配置；不传则对任意文本尝试结构化提取 */
  humanText?: HumanTextConfig
  /** 文本趣味化装饰；不传用默认规则 */
  funify?: (text: string) => string
}

const DEFAULT_HUMAN_TEXT: HumanTextConfig = { looksLikeStructured: () => true }

function createState(): AnimState {
  return shallowReactive({ sentence: '', cursor: 0, refs: 0, driver: null, takeOver: null })
}

/**
 * 打字机动画 composable — pending 阶段流式文本预览
 *
 * 流程：extractDisplayText → typeIn → loop(wait → extract → deleteOut → typeIn)
 *
 * @param sourceText - 流式原始文本（pending 代码块内容）
 */
export function usePendingTypewriter(
  sourceText: Ref<string> | ComputedRef<string>,
  options: PendingTypewriterOptions = {},
) {
  const opts = { ...DEFAULTS, ...options }
  const humanTextConfig = options.humanText ?? DEFAULT_HUMAN_TEXT
  const funify = options.funify ?? ((text: string) => funifyText(text))
  const keyed = options.stateKey !== undefined

  const id = Symbol('pending-typewriter')
  const instanceState = createState()
  let state: AnimState | null = null
  /** 本实例的定时器句柄——仅 driver 实例持有运行中的链 */
  let myTimer: ReturnType<typeof setTimeout> | null = null

  function stateKey(): string {
    return String(toValue(options.stateKey as Ref<string> | ComputedRef<string> | string))
  }

  /** 注册引用并返回共享状态（每实例仅调用一次） */
  function acquireState(): AnimState {
    if (state) return state
    if (!keyed) {
      state = instanceState
    } else {
      const key = stateKey()
      let s = store.get(key)
      if (!s) {
        s = createState()
        store.set(key, s)
      }
      state = s
    }
    state.refs++
    return state
  }

  /** driver 存活性判定 */
  function hasLiveDriver(s: AnimState): boolean {
    return s.driver !== null && liveInstances.has(s.driver)
  }

  /** 逐字打字机显示（仅 driver 执行） */
  function typeIn(s: AnimState, sentence: string, onDone: () => void) {
    s.sentence = sentence
    function step() {
      if (!liveInstances.has(id) || s.driver !== id) return
      if (s.cursor < s.sentence.length) {
        s.cursor++
        myTimer = setTimeout(step, opts.typingSpeed)
      } else {
        onDone()
      }
    }
    step()
  }

  /** 逐字逆打字机删除（仅 driver 执行） */
  function deleteOut(s: AnimState, onDone: () => void) {
    function step() {
      if (!liveInstances.has(id) || s.driver !== id) return
      if (s.cursor > 0) {
        s.cursor--
        myTimer = setTimeout(step, opts.deletingSpeed)
      } else {
        onDone()
      }
    }
    step()
  }

  /** 根据句子长度计算等待时间：15 字 = 基准，每 ±1 字 ±20ms；下限 200ms 防热循环 */
  function calcWaitPeriod(sentence: string): number {
    return Math.max(200, opts.waitPeriod + (sentence.length - 15) * 20)
  }

  /** 主循环：按当前句长等待 → 取新句子 → 趣味化 → 删旧 → 打新 → 等下一轮 */
  function loop(s: AnimState) {
    const period = calcWaitPeriod(s.sentence)
    myTimer = setTimeout(() => {
      if (!liveInstances.has(id) || s.driver !== id) return
      const raw = extractDisplayText(sourceText.value, humanTextConfig) ?? opts.defaultText
      const next = funify(raw)
      if (next === s.sentence) {
        loop(s)
        return
      }
      deleteOut(s, () => typeIn(s, next, () => loop(s)))
    }, period)
  }

  /** 成为 driver 并从当前状态启动/续跑动画链 */
  function startDriving(s: AnimState) {
    s.driver = id
    s.takeOver = null

    // 已完成打字 → 直接进入循环
    if (s.sentence && s.cursor >= s.sentence.length) {
      loop(s)
      return
    }
    // 中途中断（如前任 driver 卸载移交）→ 继续打字
    if (s.sentence) {
      typeIn(s, s.sentence, () => loop(s))
      return
    }

    // 全新状态：先等 1 秒（只显示 loading 态），再开始 extract + typeIn
    myTimer = setTimeout(() => {
      if (!liveInstances.has(id) || s.driver !== id) return
      const raw = extractDisplayText(sourceText.value, humanTextConfig) ?? opts.defaultText
      const sentence = funify(raw)
      typeIn(s, sentence, () => loop(s))
    }, 1000)
  }

  function start() {
    const s = acquireState()
    if (hasLiveDriver(s)) {
      // 已有驱动者：登记接管回调，共享读取动画状态
      s.takeOver = () => startDriving(s)
      return
    }
    startDriving(s)
  }

  /** 释放本实例：清自己的定时器、退引用；driver 卸载时移交驱动权 */
  function release() {
    if (myTimer) {
      clearTimeout(myTimer)
      myTimer = null
    }
    const s = state
    if (!s) return
    if (s.driver === id) {
      s.driver = null
      // 仍有存活共享实例 → 移交驱动权（不移交则存活实例动画停滞）
      if (s.refs > 1 && s.takeOver) {
        const fn = s.takeOver
        s.takeOver = null
        fn()
      }
    }
    s.refs--
    if (keyed && s.refs <= 0) {
      store.delete(stateKey())
    }
    state = null
  }

  function cleanup() {
    release()
  }

  /**
   * 执行退出删除动画：停止当前循环，逐字删除，完成后调用 onDone。
   * 用于 widget 接管渲染前展示删除过渡。
   * 仅 driver 实例可执行删除；非 driver 直接回调。
   */
  function exit(onDone?: () => void) {
    const s = state ?? acquireState()
    if (s.driver !== id) {
      if (onDone) onDone()
      return
    }
    if (myTimer) {
      clearTimeout(myTimer)
      myTimer = null
    }
    deleteOut(s, () => {
      if (onDone) onDone()
    })
  }

  // displayText 经响应式状态自动同步：driver 更新 cursor，所有共享实例同步刷新
  const displayText = computed(() => {
    const s = state ?? acquireState()
    return s.sentence.slice(0, s.cursor)
  })

  onMounted(() => {
    liveInstances.add(id)
    start()
  })
  onUnmounted(() => {
    liveInstances.delete(id)
    release()
  })

  return { displayText, cleanup, exit }
}
