import { describe, expect, it } from 'vitest'
import { scanBalancedItems } from '../src/core/bracket-scanner'
import { createSpecDetector } from '../src/core/spec-detector'
import { cxSpecDetectorConfig } from '../src/cx'

describe('review 修复', () => {
  it('占位符属性转义：key 含双引号不破坏 HTML', () => {
    const detector = createSpecDetector(cxSpecDetectorConfig)
    const evilKey = 'a"b'
    const r = detector.extractSpecs(
      `\`\`\`json\n{"key":${JSON.stringify(evilKey)},"data":{}}\n\`\`\``,
    )
    expect(r.status).toBe('success')
    // 转义后属性保持完整：不能出现未转义的 " 截断属性
    expect(r.content).toContain('data-spec-key="a&quot;b"')
    expect(r.content).not.toContain('data-spec-key="a"b"')
  })

  it('占位符属性转义：key 含尖括号不注入标签', () => {
    const detector = createSpecDetector(cxSpecDetectorConfig)
    const r = detector.extractSpecs('```json\n{"key":"<img src=x>","data":{}}\n```')
    expect(r.status).toBe('success')
    expect(r.content).toContain('&lt;img src=x&gt;')
    expect(r.content).not.toContain('data-spec-key="<img')
  })

  it('fence 含正则元字符不抛错且正常匹配', () => {
    const detector = createSpecDetector({
      ...cxSpecDetectorConfig,
      fence: 'c++',
      looksLikeSpecPrefix: () => true, // c++ 围栏内容不以 { 开头，放宽前缀以便测试围栏解析本身
    })
    const r = detector.extractSpecs('```c++\n{"key":"cx-text","data":{}}\n```')
    expect(r.status).toBe('success')
    expect(r.content).toContain('<widget-slot')
  })

  it('key 与冒号间为 tab/换行仍能正确入路径', () => {
    const jsonTab = '{"columns"\t:[{"a":1}]}'
    expect(scanBalancedItems(jsonTab, ['columns', '*'])).toHaveLength(1)

    const jsonNewline = '{"columns"\n:[{"a":1}]}'
    expect(scanBalancedItems(jsonNewline, ['columns', '*'])).toHaveLength(1)
  })
})
