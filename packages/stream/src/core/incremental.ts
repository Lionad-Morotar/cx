/**
 * 增量渲染管线
 *
 * 在流式 JSON 未闭合阶段，提取已完整传输的组件数据构造可渲染的部分 Spec，
 * 解决大数组（如表格行）传输期间用户只能看 loading 的体感问题。
 * （源自线上 AI 聊天场景的生产渲染管线，重写为三方库无关的通用实现，见包 readme）
 *
 * 管线：括号平衡扫描（按已注册 trigger 的 scanPaths）
 *   → 截断至最远完整结构 + 补严格闭合括号
 *   → jsonrepair 修正 → parse
 *   → 协议匹配（matchTrigger）→ buildPartial 构造部分 Spec
 *
 * lastValid 缓存：流式中某些 delta 的截断会导致解析失败，
 * 此时保持上次有效结果而非返回 null，避免渲染组件闪没。
 *
 * 管线对协议无感知：trigger 注册与协议匹配均由调用方注入。
 */

import { scanBalancedItems } from './bracket-scanner'
import { fenceBlockPattern } from './fence'
import { safeJsonParse } from './parse'
import { furthestEvent, scanStreamEvents } from './stream-events'

import type { PathSegment, ScanMatch, ScanPath } from './types'

/** trigger 扫描结果：scanPath JSON 序列化 → 该路径上的匹配列表 */
export type MatchesPerPath = Map<string, ScanMatch[]>

/** 增量渲染 Trigger：定义某个组件键的增量规则 */
export interface IncrementalTrigger<TSpec> {
  /** bracket-scanner 扫描路径（如 `['data', 'rows', '*']`） */
  scanPaths: ScanPath[]
  /**
   * 从完整解析的 Spec 中提取增量数据，构造部分 Spec。
   * 返回 null 表示数据不足以构造有效结果（管线保持 lastValid）。
   */
  buildPartial: (spec: TSpec, matchesPerPath: MatchesPerPath) => TSpec | null
  /**
   * 无 scanPath 匹配时以标量闭合事件为截断源（标量主体形态）。
   * 声明后管线在 best 为空时对其整段扫描闭合事件、截断至最远闭合点，
   * 并以空 matchesPerPath 调用 buildPartial——数组/区域形态在空匹配下
   * 本就返回 null，故本标记只对「空匹配也能产帧」的形态有意义。
   */
  usesClosureEvents?: boolean
  /**
   * 出帧节流（delta 数）：距上次出帧不足 N 个 delta 时新帧被节流，
   * 内容并入窗口到期后的下一帧；缺省 1（每 delta 都可出帧）。
   * 末尾等不到窗口的属性由围栏闭合后的终态 spec 兜底，不影响终态。
   */
  frameStride?: number
}

/** Trigger 注册表（工厂创建，实例间互不污染） */
export interface TriggerRegistry<TSpec> {
  register: (key: string, trigger: IncrementalTrigger<TSpec>) => void
  unregister: (key: string) => boolean
  get: (key: string) => IncrementalTrigger<TSpec> | undefined
  has: (key: string) => boolean
  entries: () => IterableIterator<[string, IncrementalTrigger<TSpec>]>
  readonly size: number
}

export function createTriggerRegistry<TSpec = unknown>(): TriggerRegistry<TSpec> {
  const map = new Map<string, IncrementalTrigger<TSpec>>()
  return {
    register: (key, trigger) => {
      map.set(key, trigger)
    },
    unregister: (key) => map.delete(key),
    get: (key) => map.get(key),
    has: (key) => map.has(key),
    entries: () => map.entries(),
    get size() {
      return map.size
    },
  }
}

export interface IncrementalExtractorConfig<TSpec> {
  registry: TriggerRegistry<TSpec>
  /** 从完整解析的 Spec 中匹配 trigger（协议相关：如 cx 按节点 key 匹配） */
  matchTrigger: (
    spec: TSpec,
    registry: TriggerRegistry<TSpec>,
  ) => [string, IncrementalTrigger<TSpec>] | null
  /** 代码围栏语言标记（输入文本可能含围栏），默认 'json' */
  fence?: string
  /** jsonrepair 内存保护长度上限 */
  maxRepairLength?: number
}

export interface IncrementalExtractor<TSpec> {
  /** 喂入当前全量原始文本（可含 ```fence 围栏），返回当前可渲染的部分 Spec */
  next: (rawText: string) => TSpec | null
  /** 清除 lastValid 缓存（如消息切换时） */
  reset: () => void
}

/**
 * 根据匹配的具体路径生成严格闭合括号序列。
 *
 * 截断点之后所有未闭合容器都需要闭合：路径第 L 层容器的类型
 * 由其子节点寻址方式决定——数字段（数组索引）→ `]`，字符串段（对象 key）→ `}`。
 * 比"一律补 `}` 再靠 jsonrepair 兜底"更精确，减少修复器负担。
 */
export function closingBrackets(concretePath: PathSegment[]): string {
  let out = ''
  for (let l = concretePath.length - 1; l >= 0; l--) {
    out += typeof concretePath[l] === 'number' ? ']' : '}'
  }
  return out
}

export function createIncrementalExtractor<TSpec = unknown>(
  config: IncrementalExtractorConfig<TSpec>,
): IncrementalExtractor<TSpec> {
  let lastValid: TSpec | null = null
  const fence = config.fence ?? 'json'

  // --- 标量闭合事件分支的跨调用状态 ---
  // deltaCount：next() 调用计数，frameStride 的「帧」语义单位
  // lastTruncated：上次参与解析的截断文本——帧不变判据用文本比较而非位置
  // 记录，换围栏（新 pending 块从头生长）后位置状态会失效，文本比较天然安全
  // lastEmitDelta 为 null 表示尚未出帧：首帧（空壳挂载）不受节流
  let deltaCount = 0
  let lastTruncated: string | null = null
  let lastEmitDelta: number | null = null
  let pendingEmit = false
  let pendingTrigger: IncrementalTrigger<TSpec> | null = null

  // 注册表是否含声明闭合事件的 trigger（标量主体形态）；注册表动态，现用现查
  function hasClosureTriggers(): boolean {
    for (const [, trigger] of config.registry.entries()) {
      if (trigger.usesClosureEvents) return true
    }
    return false
  }

  /**
   * 无 scanPath 匹配时的回退：标量闭合事件截断 → 空匹配构造帧。
   * 仅注册表含 usesClosureEvents trigger 时激活，未注册时与既有行为逐位一致；
   * 非 scalar trigger 在空匹配下 buildPartial 返回 null，天然不产帧。
   */
  function closureFallback(text: string): TSpec | null {
    if (!hasClosureTriggers()) return lastValid

    const furthest = furthestEvent(scanStreamEvents(text))
    if (!furthest) return lastValid

    const truncated = text.slice(0, furthest.end + 1) + closingBrackets(furthest.path)
    // 终态判定：原文无需修复即完整 JSON（纯 JSON 剧本播完、围栏闭合后的
    // 完整文本）时完整帧必须出帧——末尾扎堆闭合的短字段若被节流窗口压掉，
    // 流结束后的终态会停在缺字段的中间态，再无后续 delta 把它补出
    let complete: unknown = null
    try {
      complete = JSON.parse(text)
    } catch {
      // 未完整：走截断帧节流路径
    }
    const windowDone =
      complete !== null ||
      lastEmitDelta === null ||
      deltaCount - lastEmitDelta >= (pendingTrigger?.frameStride ?? 1)
    const due = pendingEmit && windowDone
    // 截断产物未变且窗口未到期：帧必然不变，跳过解析与构造
    if (truncated === lastTruncated && !due) return lastValid

    let parsed: unknown
    try {
      parsed = complete ?? safeJsonParse(truncated, { maxRepairLength: config.maxRepairLength })
    } catch {
      return lastValid
    }
    if (!parsed || typeof parsed !== 'object') return lastValid

    const spec = parsed as TSpec
    const matched = config.matchTrigger(spec, config.registry)
    if (!matched) return lastValid
    const partial = matched[1].buildPartial(spec, new Map())
    if (!partial) return lastValid

    lastTruncated = truncated
    const stridePassed =
      complete !== null ||
      lastEmitDelta === null ||
      deltaCount - lastEmitDelta >= (matched[1].frameStride ?? 1)
    if (stridePassed) {
      lastEmitDelta = deltaCount
      pendingEmit = false
      pendingTrigger = null
      lastValid = partial
    } else {
      // 被节流：内容不丢失，并入窗口到期后的下一帧
      pendingEmit = true
      pendingTrigger = matched[1]
    }
    return lastValid
  }

  function next(rawText: string): TSpec | null {
    deltaCount++
    const raw = rawText
    if (!raw) {
      lastValid = null
      return null
    }

    // --- Step 0: 从 markdown 代码块中定位目标 JSON ---
    // 多代码块场景：取最后一个未闭合的块（当前正在流式的那个）。
    // 无代码块时输入视为已隔离的纯 JSON（如 pendingSources 直送）。
    const jsonMatches = Array.from(raw.matchAll(fenceBlockPattern(fence)))
    let target: string | null = null
    for (const m of jsonMatches) {
      if (!(m[0] ?? '').endsWith('```')) target = m[1] ?? null
    }
    const text = target ?? raw
    if (!text.trim()) return lastValid

    // --- Step 1: 收集所有已注册 trigger 的扫描路径 ---
    const allPaths: ScanPath[] = []
    for (const [, trigger] of config.registry.entries()) {
      allPaths.push(...trigger.scanPaths)
    }
    if (allPaths.length === 0) return closureFallback(text)

    // --- Step 2: 扫描所有路径，收集匹配 ---
    const matchesPerPath: MatchesPerPath = new Map()
    let best: ScanMatch | null = null

    for (const path of allPaths) {
      const matches = scanBalancedItems(text, path)
      if (matches.length > 0) {
        matchesPerPath.set(JSON.stringify(path), matches)
        const last = matches.at(-1)
        if (last && (!best || last.end > best.end)) best = last
      }
    }

    if (!best) return closureFallback(text)

    // --- Step 3: 截断至最远匹配 + 补严格闭合括号 ---
    const truncated = text.slice(0, best.end + 1) + closingBrackets(best.path)

    // 终态判定：原文无需修复即完整 JSON 时以完整 spec 构造终帧——主数组/区域
    // 之后的尾随字段不在任何 scanPath 上，截断路径会把它们从所有帧中剔除，
    // 终态停在缺字段中间态（与闭合事件分支的完整帧兜底同一判据）
    let complete: unknown = null
    try {
      complete = JSON.parse(text)
    } catch {
      // 未完整：走截断路径
    }

    // --- Step 4: jsonrepair + parse ---
    let parsed: unknown
    try {
      parsed = complete ?? safeJsonParse(truncated, { maxRepairLength: config.maxRepairLength })
    } catch {
      return lastValid // 解析失败：保持上次有效状态，避免渲染组件消失
    }

    if (!parsed || typeof parsed !== 'object') return lastValid

    const spec = parsed as TSpec

    // --- Step 5: 协议匹配 + 构造部分 Spec ---
    const matched = config.matchTrigger(spec, config.registry)
    if (matched) {
      const partial = matched[1].buildPartial(spec, matchesPerPath)
      if (partial) {
        lastValid = partial
        return partial
      }
    }

    return lastValid
  }

  return {
    next,
    reset: () => {
      lastValid = null
      deltaCount = 0
      lastTruncated = null
      lastEmitDelta = null
      pendingEmit = false
      pendingTrigger = null
    },
  }
}
