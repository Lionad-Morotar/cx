/**
 * 流式事件扫描器
 *
 * 与 scanBalancedItems 同一字符级状态机骨架，单趟扫描导出三类信号：
 * 标量闭合事件、容器闭合事件、流式叶子（扫描终止时正在积累的位置）。
 *
 * 服务于标量主体组件的属性级流式切分：属性「完成」即切分点——
 * 字符串值由闭引号判定，数字/布尔/null 由 `,` `}` `]` 界符收尾推断。
 * 截断至最远闭合事件的帧内每个值都是完整传输的真实前缀，
 * 不经 jsonrepair 伪造半值（机制取证见
 * docs/research/2026-08-01-scalar-stream-strategies.md）。
 *
 * 注意与 scanBalancedItems 的状态差异：本扫描器在值完成时清除 sawColon，
 * 据此区分流式叶子是 key（属性名未闭合）还是 value（属性值积累中）。
 * 每次调用对全量文本独立扫描，无跨调用状态。
 */

import type { PathSegment, ScanMatch } from './types'

/** 流式叶子：扫描终止时正在积累的位置 */
export interface StreamingLeaf {
  /**
   * 正在积累的属性完整路径；属性名未闭合（mid-key）时退化为所在容器路径——
   * 此时该属性尚未开始，调用方不应据末段推断属性名
   */
  path: PathSegment[]
  /** 积累方式：字符串内 / 原始值片段（数字、true、false、null） */
  kind: 'string' | 'primitive'
  /** 已积累的原始文本（字符串为开引号后内容，原始值为首字符起） */
  partial: string
}

export interface StreamEvents {
  /** 标量值闭合事件（含字符串项数组的逐项），按文本序；end 为值末字符索引（inclusive） */
  closures: ScanMatch[]
  /** 容器闭合事件（scanBalancedItems 的无目标路径全量版，不含根容器），按文本序 */
  containers: ScanMatch[]
  /** 流式叶子；文本恰好止于界符/空白时为 null */
  leaf: StreamingLeaf | null
}

/**
 * 在不完整 JSON 文本上单趟扫描，导出全部流式事件。
 *
 * @param text - JSON 文本（可以不完整，通常已按围栏隔离）
 */
export function scanStreamEvents(text: string): StreamEvents {
  const closures: ScanMatch[] = []
  const containers: ScanMatch[] = []
  let leaf: StreamingLeaf | null = null

  // --- 路径追踪状态（同 scanBalancedItems）---
  const path: (string | number | null)[] = []
  const arrIdx: number[] = []
  const pendingKey: (string | null)[] = []
  const sawColon: boolean[] = []
  // 每层未决原始值的起始位置；原始值没有引号边界，靠界符收尾
  const primitiveAt: (number | null)[] = []

  let depth = 0
  let seenRoot = false
  let rootIsArray = false
  let rootArrIdx = 0

  // 当前值的末段路径：对象属性取 pendingKey，数组元素取索引
  const valueSegment = (): string | number | null => {
    if (path.length === 0) {
      return rootIsArray ? rootArrIdx : pendingKey[0] ?? null
    }
    const parent = arrIdx[depth - 1]
    if (parent !== undefined && parent >= 0) return parent
    return pendingKey[depth] ?? null
  }

  // 原始值由界符收尾：回扫界符前空白定位值末字符
  const emitPrimitive = (endPos: number) => {
    if (primitiveAt[depth] == null) return
    const seg = valueSegment()
    if (seg !== null) {
      let e = endPos - 1
      while (e >= 0 && (text[e] === ' ' || text[e] === '\t' || text[e] === '\n' || text[e] === '\r'))
        e--
      closures.push({ end: e, path: [...path, seg] as PathSegment[] })
    }
    primitiveAt[depth] = null
    sawColon[depth] = false
  }

  let i = 0
  scan: while (i < text.length) {
    const ch = text[i]

    // --- 字符串 ---
    if (ch === '"') {
      let j = i + 1
      while (j < text.length) {
        if (text[j] === '\\') {
          j += 2
          continue
        }
        if (text[j] === '"') break
        j++
      }
      if (j >= text.length) {
        // 字符串未闭合 = 流式叶子。sawColon 为真（值位置）或在数组上下文中
        // 才是 value 积累；否则是属性名未闭合，叶子退化为所在容器路径
        const inArrayCtx = path.length > 0 && (arrIdx[depth - 1] ?? -1) >= 0
        const isValue = sawColon[depth] === true || (inArrayCtx && pendingKey[depth] == null)
        const seg = isValue ? valueSegment() : null
        leaf = {
          path: (seg !== null ? [...path, seg] : [...path]) as PathSegment[],
          kind: 'string',
          partial: text.slice(i + 1),
        }
        break scan
      }

      const str = text.slice(i + 1, j)

      // 冒号前的字符串 = key（key 与冒号间允许任意空白）
      let k = j + 1
      while (
        k < text.length &&
        (text[k] === ' ' || text[k] === '\t' || text[k] === '\n' || text[k] === '\r')
      )
        k++
      if (k < text.length && text[k] === ':') {
        pendingKey[depth] = str
      } else if (k >= text.length) {
        // 字符串恰好闭合在文本末尾，按位置判别：
        // 值位置（冒号后 / 数组项）闭引号即完整——字符串闭合后不会再有属于
        // 该值的字符（与数字不同，3 可能是 30 的前缀，"abc" 闭合后不会变长）；
        // key 位置（对象属性名）角色未决——误判为 value 闭合会让截断点落在
        // 裸 key 上，jsonrepair 被迫补出无值属性污染帧，不产事件待冒号判别
        const inArrayCtx =
          (rootIsArray && path.length === 0) || (path.length > 0 && (arrIdx[depth - 1] ?? -1) >= 0)
        if (sawColon[depth] === true || inArrayCtx) {
          const seg = valueSegment()
          if (seg !== null) closures.push({ end: j, path: [...path, seg] as PathSegment[] })
          primitiveAt[depth] = null
          sawColon[depth] = false
        } else {
          break scan
        }
      } else {
        // 字符串 value 闭合
        const seg = valueSegment()
        if (seg !== null) closures.push({ end: j, path: [...path, seg] as PathSegment[] })
        primitiveAt[depth] = null
        sawColon[depth] = false
      }

      i = j + 1
      continue
    }

    // --- 对象 / 数组 开 ---
    if (ch === '{' || ch === '[') {
      if (!seenRoot) {
        seenRoot = true
        rootIsArray = ch === '['
        rootArrIdx = 0
        i++
        continue
      }

      const pk = (sawColon[depth] ? pendingKey[depth] : null) ?? null
      sawColon[depth] = false
      pendingKey[depth] = null
      primitiveAt[depth] = null

      if (rootIsArray && depth === 0 && pk === null) {
        path.push(rootArrIdx)
        arrIdx.push(ch === '[' ? 0 : -1)
        pendingKey.push(null)
        sawColon.push(false)
        primitiveAt.push(null)
        depth++
        i++
        continue
      }

      if (pk !== null || path.length > 0) {
        const lastArrIdx = arrIdx.length > 0 ? arrIdx[arrIdx.length - 1]! : -1
        const segment = pk ?? (lastArrIdx >= 0 ? lastArrIdx : null)
        path.push(segment)
        arrIdx.push(ch === '[' ? 0 : -1)
        pendingKey.push(null)
        sawColon.push(false)
        primitiveAt.push(null)
        depth++
      }
      i++
      continue
    }

    // --- 对象 / 数组 闭 ---
    if (ch === '}' || ch === ']') {
      // 末位属性无逗号：容器闭括号先把同层未决原始值收尾
      emitPrimitive(i)
      if (path.length > 0) {
        depth--
        containers.push({ end: i, path: path.map((s): PathSegment => s ?? '') })
        path.pop()
        arrIdx.pop()
        pendingKey.pop()
        sawColon.pop()
        primitiveAt.pop()
      }
      i++
      continue
    }

    // --- 逗号：同层还有后续值，收尾未决原始值 ---
    if (ch === ',') {
      emitPrimitive(i)
      if (depth === 0 && rootIsArray) {
        rootArrIdx++
        sawColon[0] = false
        i++
        continue
      }
      if (depth > 0) {
        const parentArrIdx = arrIdx[depth - 1]!
        if (parentArrIdx >= 0) {
          arrIdx[depth - 1]!++
          sawColon[depth] = false
        }
      }
      i++
      continue
    }

    // --- 冒号 ---
    if (ch === ':') {
      sawColon[depth] = true
      i++
      continue
    }

    // --- 空白 / 其他：非空白非结构字符 = 原始值字符 ---
    if (ch !== ' ' && ch !== '\t' && ch !== '\n' && ch !== '\r') {
      if (primitiveAt[depth] == null) primitiveAt[depth] = i
    }
    i++
  }

  // EOF 仍有未决原始值 = 流式中的原始值叶子
  if (!leaf && primitiveAt[depth] != null) {
    const seg = valueSegment()
    leaf = {
      path: (seg !== null ? [...path, seg] : [...path]) as PathSegment[],
      kind: 'primitive',
      partial: text.slice(primitiveAt[depth]!),
    }
  }

  return { closures, containers, leaf }
}

/**
 * 取全部闭合事件（标量 + 容器）中文本位置最前者。
 * 供管线竞争截断点：end 单调推进，无推进即无新内容。
 */
export function furthestEvent(events: StreamEvents): ScanMatch | null {
  const lastClosure = events.closures.at(-1)
  const lastContainer = events.containers.at(-1)
  if (!lastClosure) return lastContainer ?? null
  if (!lastContainer) return lastClosure
  return lastClosure.end >= lastContainer.end ? lastClosure : lastContainer
}
