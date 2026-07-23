/** 转义正则元字符，使字面量可安全插入 RegExp */
export function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * 构造围栏代码块扫描正则：捕获组 1 为块内容，
 * 同时匹配已闭合（以 ``` 结尾）与未闭合（延伸到文本尾）两种形态。
 */
export function fenceBlockPattern(fence: string): RegExp {
  return new RegExp(`\`\`\`${escapeRegExp(fence)}\\s*\\n([\\s\\S]*?)(?:\\n\`\`\`|$)`, 'g')
}
