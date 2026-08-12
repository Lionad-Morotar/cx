/**
 * action-label — actions 配置的按钮 label 查表
 *
 * 动作类回写语义 = 用户所点按钮的 label(写死语义词与按钮必然漂移)。包装件
 * re-emit action 时以此查出 label 附进载荷末参;查不到(actions 缺省/形态异常)
 * 返回 undefined,语义层落 i18n 对齐兜底词。
 */

/** actions 数组按 id 取 label;非数组/未命中/label 非字符串一律 undefined */
export function findActionLabel(actions: unknown, actionId: string): string | undefined {
  if (!Array.isArray(actions)) return undefined
  const hit = actions.find(
    (a) => a && typeof a === 'object' && (a as { id?: unknown }).id === actionId
  )
  const label = (hit as { label?: unknown } | undefined)?.label
  return typeof label === 'string' && label ? label : undefined
}
