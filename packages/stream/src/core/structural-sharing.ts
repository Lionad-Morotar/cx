/**
 * 结构共享（structural sharing，与 Immer 同名实践）：帧间合并——把 next 树中
 * 与 prev 树同值的子树替换为 prev 引用，未变部分保持引用稳定。
 *
 * 增量管线每帧对截断文本重新 JSON.parse，产出全新引用的对象树；消费侧
 * （Vue 渲染器）按引用比较 props，内容未变但引用已变的子树会触发无效
 * patch，物料内部交互态（如 tabs 当前激活项）被按帧冲刷。合并未变子树
 * 引用后，同值 props 引用稳定，渲染器按 key 跳过 patch，整树渲染开销下降。
 *
 * 约束：
 * - 仅适用 JSON 形态的纯数据树（对象/数组/原始值，无环、无类实例）
 * - 数组长度变化或对象键集变化时整体采用 next：增长/缩减本身是内容变化，
 *   父级应当感知，子项级共享由下一帧的同形比较自然收敛
 * - 消费侧不得原地修改帧对象（既有 lastValid 缓存语义本就共享引用）
 */

/**
 * 把 next 树中与 prev 树同值的部分替换为 prev 引用。
 * 全树同值时直接返回 prev；否则返回「未变子树复用 prev 引用」的新树。
 */
export function shareStructure<T>(prev: T | null | undefined, next: T): T {
  // 同引用或同原始值：直接复用（覆盖 prev null/undefined 之外的恒等情形）
  if (Object.is(prev, next)) return next
  if (prev == null || next == null) return next
  if (typeof prev !== 'object' || typeof next !== 'object') return next

  const prevIsArray = Array.isArray(prev)
  const nextIsArray = Array.isArray(next)
  if (prevIsArray !== nextIsArray) return next

  if (prevIsArray && nextIsArray) {
    if (prev.length !== next.length) return next
    let reusable = true
    const out: unknown[] = new Array(next.length)
    for (let i = 0; i < next.length; i++) {
      const shared = shareStructure(prev[i], next[i])
      out[i] = shared
      if (!Object.is(shared, prev[i])) reusable = false
    }
    return (reusable ? prev : out) as T
  }

  const p = prev as Record<string, unknown>
  const n = next as Record<string, unknown>
  if (Object.keys(p).length !== Object.keys(n).length) return next
  let reusable = true
  const out: Record<string, unknown> = {}
  for (const k of Object.keys(n)) {
    if (!Object.prototype.hasOwnProperty.call(p, k)) return next
    const shared = shareStructure(p[k], n[k])
    out[k] = shared
    if (!Object.is(shared, p[k])) reusable = false
  }
  return (reusable ? prev : out) as T
}
