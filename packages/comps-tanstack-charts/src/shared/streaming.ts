/**
 * 读取 trigger 注入的流式骨架标记（_cx_streaming，下划线前缀键不会透传物料）。
 * 标记列出未闭合的 skeleton 顶层字段；包装层据此在主体未闭合期间渲染骨架。
 */
export function streamingFields(attrs: Record<string, unknown>): string[] {
  const fields = attrs._cx_streaming
  return Array.isArray(fields) ? (fields as string[]) : []
}
