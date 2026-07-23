/**
 * 字符级 JSON 括号平衡扫描器
 *
 * 在不完整/流式 JSON 文本中，按路径检测容器是否括号平衡。
 * 用于增量渲染管线：检测流式传输中特定 JSON 节点（如表格组件的
 * columns/rows item）是否已完整传输，以决定是否触发渲染。
 *
 * 对树形状无感知：路径段匹配对象 key / 数组索引，`'*'` 通配任意。
 * 根容器支持两种形状：
 * - 对象根 `{...}`：路径从根对象的属性 key 开始（如 `['data', 'rows', '*']`）
 * - 数组根 `[...]`：顶层元素以索引作为首段路径（如 `[0, 'data', 'rows', '*']`
 *   或 `['*', 'data', 'rows', '*']`）
 *
 * @example
 * ```ts
 * const matches = scanBalancedItems(json, ['data', 'columns', '*'])
 * // matches = [{ end: 122 }, { end: 245 }] — 每个 item 闭合括号的位置
 * ```
 */

import type { PathSegment, ScanMatch, ScanPath } from './types'

/**
 * 在不完整 JSON 文本中扫描指定路径上所有括号平衡的容器。
 *
 * @param text - JSON 文本（可以不完整）
 * @param targetPath - 目标路径，如 `['data', 'columns', '*']`
 * @returns 所有匹配项的闭合位置，按出现顺序排列
 */
export function scanBalancedItems(text: string, targetPath: ScanPath): ScanMatch[] {
  if (!text || targetPath.length === 0) return []

  const matches: ScanMatch[] = []

  // --- 路径追踪状态 ---
  const path: (string | number | null)[] = [] // 当前 JSON 结构路径
  const arrIdx: number[] = [] // 数组元素计数器栈
  const pendingKey: (string | null)[] = [] // 每层待处理的 key
  const sawColon: boolean[] = [] // 当前深度是否刚见过冒号（key: 后的 `{` 是 value）

  let depth = 0 // {} / [] 嵌套深度
  let i = 0

  // --- 根容器状态 ---
  // 最外层 JSON 容器是语法结构而非数据：对象根不入路径；
  // 数组根自身不入路径，但其元素以索引作为首段路径入路径。
  let seenRoot = false
  let rootIsArray = false
  let rootArrIdx = 0

  while (i < text.length) {
    const ch = text[i]

    // --- 字符串：跳过内容，处理转义 ---
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
      if (j >= text.length) break // 字符串未闭合，终止扫描

      const str = text.slice(i + 1, j)

      // 冒号前的字符串 = key（key 与冒号间允许任意空白：空格/tab/换行）
      let k = j + 1
      while (
        k < text.length &&
        (text[k] === ' ' || text[k] === '\t' || text[k] === '\n' || text[k] === '\r')
      )
        k++
      if (k < text.length && text[k] === ':') {
        pendingKey[depth] = str
      }

      i = j + 1
      continue
    }

    // --- 对象 / 数组 开 ---
    if (ch === '{' || ch === '[') {
      // 首个容器 = 最外层 JSON 容器，不入路径
      if (!seenRoot) {
        seenRoot = true
        rootIsArray = ch === '['
        rootArrIdx = 0
        i++
        continue
      }

      // 仅当 sawColon[d] 为 true 时，当前 `{`/`[` 才是前一个 key 的 value
      // 否则是数组中的独立元素（如表格的行对象）
      const pk = (sawColon[depth] ? pendingKey[depth] : null) ?? null
      sawColon[depth] = false
      pendingKey[depth] = null

      // 顶层数组的直接元素：以元素索引作为首段路径
      if (rootIsArray && depth === 0 && pk === null) {
        path.push(rootArrIdx)
        arrIdx.push(ch === '[' ? 0 : -1)
        pendingKey.push(null)
        sawColon.push(false)
        depth++
        i++
        continue
      }

      if (pk !== null || path.length > 0) {
        // 数组元素使用当前数组索引，对象属性使用 key
        const lastArrIdx = arrIdx.length > 0 ? arrIdx[arrIdx.length - 1]! : -1
        const segment = pk ?? (lastArrIdx >= 0 ? lastArrIdx : null)
        path.push(segment)
        arrIdx.push(ch === '[' ? 0 : -1)
        pendingKey.push(null)
        sawColon.push(false)
        depth++
      }
      i++
      continue
    }

    // --- 对象 / 数组 闭 ---
    if (ch === '}' || ch === ']') {
      if (path.length > 0) {
        depth--

        if (matchesPath(path, targetPath)) {
          // 复制具体路径（path 随后会出栈变更）；null 段理论上不出现，兜底为 ''
          matches.push({ end: i, path: path.map((s): PathSegment => s ?? '') })
        }

        path.pop()
        arrIdx.pop()
        pendingKey.pop()
        sawColon.pop()
      }
      i++
      continue
    }

    // --- 逗号 ---
    if (ch === ',') {
      // 顶层数组元素分隔：递增根元素索引
      if (depth === 0 && rootIsArray) {
        rootArrIdx++
        sawColon[0] = false
        i++
        continue
      }
      // 其他层：数组索引递增，清除当前层数组元素的冒号状态
      if (depth > 0) {
        const parentArrIdx = arrIdx[depth - 1]!
        if (parentArrIdx >= 0) {
          arrIdx[depth - 1]!++
          // 数组内部的逗号：清除当前深度的冒号状态
          // 防止下一个数组元素误继承前一个元素的 key
          sawColon[depth] = false
        }
      }
      i++
      continue
    }

    // --- 冒号：标记当前深度刚见过冒号 ---
    if (ch === ':') {
      sawColon[depth] = true
      i++
      continue
    }

    // --- 空白 / 其他 ---
    i++
  }

  return matches
}

/**
 * 判断当前路径是否匹配目标路径。
 * - `'*'` 匹配任意字符串 key 或数组索引
 * - 数字段仅匹配数组索引
 * - 字符串段仅匹配对象 key
 */
function matchesPath(current: (string | number | null)[], target: ScanPath): boolean {
  if (current.length !== target.length) return false

  for (let i = 0; i < target.length; i++) {
    const t = target[i]!
    const c = current[i]

    if (t === '*') continue // 通配

    if (typeof t === 'number') {
      if (c !== t) return false
    } else {
      if (c !== t) return false
    }
  }
  return true
}
