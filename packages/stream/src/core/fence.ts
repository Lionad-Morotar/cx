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
