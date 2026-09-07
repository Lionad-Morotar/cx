/** 转义正则元字符，使字面量可安全插入 RegExp */
export function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * 构造围栏代码块扫描正则：捕获组 1 为块内容，
 * 同时匹配已闭合（以 ``` 结尾）与未闭合（延伸到文本尾）两种形态。
 * fence 传数组时任一语言标记命中——联合为单个非捕获组正则,
 * matchAll 一次扫描即按文档序归并多围栏(如 ['json','jsonc']:
 * 模型可能模仿组件文档的 jsonc 示例围栏,单标记会静默漏提)。
 */
export function fenceBlockPattern(fence: string | string[]): RegExp {
  const tag = Array.isArray(fence)
    ? `(?:${fence.map(escapeRegExp).join('|')})`
    : escapeRegExp(fence)
  return new RegExp(`\`\`\`${tag}\\s*\\n([\\s\\S]*?)(?:\\n\`\`\`|$)`, 'g')
}

/**
 * 未闭合围栏是否按 spec pending 处理（单一判定实现，两路消费）：
 * spec-detector 的 pending 占位分支与 fallback 的收尾降级共用，
 * 保证「隔离占位」与「降级结算」对同一文本的判定不漂移。
 *
 * 已闭合围栏由常规管线结算；未闭合块内容为空/空白视为 pending（防流式
 * 初期空围栏被 markdown 渲染成代码块闪烁），非 spec 的未闭合代码块
 * （贴代码被打断等）是用户内容，交由调用方原样保留。
 */
export function isPendingSpecFenceBlock(
  fullMatch: string,
  content: string,
  looksLikeSpecPrefix: (jsonText: string) => boolean,
): boolean {
  if (fullMatch.endsWith('```')) return false
  return content.trim() === '' || looksLikeSpecPrefix(content)
}
