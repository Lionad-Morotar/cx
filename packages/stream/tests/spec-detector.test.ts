import { describe, expect, it } from 'vitest'
import { createSpecDetector } from '../src/core/spec-detector'
import { cxSpecDetectorConfig } from '../src/cx'

import type { CxStreamNode } from '../src/cx'

const detector = createSpecDetector(cxSpecDetectorConfig)

const tableSpec = `{"id":"t1","key":"cx-demo-table","data":{"columns":[{"key":"name","label":"名称"}],"rows":[{"name":"磨床"}]}}`

describe('extractSpecs（cx 预设）', () => {
  it('闭合 Spec → success + widget 占位符', () => {
    const text = `查询结果如下：\n\`\`\`json\n${tableSpec}\n\`\`\`\n以上是结果。`
    const r = detector.extractSpecs(text)
    expect(r.status).toBe('success')
    expect(r.specs).toHaveLength(1)
    expect((r.specs[0] as CxStreamNode).key).toBe('cx-demo-table')
    expect(r.content).toContain(
      '<widget-slot data-spec-index="INDEX_PLACEHOLDER" data-spec-key="cx-demo-table"',
    )
    expect(r.content).toContain('查询结果如下：')
    expect(r.content).toContain('以上是结果。')
    // 原始 JSON 不泄漏到 content
    expect(r.content).not.toContain('"rows"')
  })

  it('未闭合 Spec 代码块 → pending + pendingSources 隔离', () => {
    const partial = '{"id":"t1","key":"cx-demo-table","data":{"rows":[{"name":"磨'
    const r = detector.extractSpecs(`\`\`\`json\n${partial}`)
    expect(r.status).toBe('pending')
    expect(r.pendingSources).toEqual([partial])
    expect(r.content).toContain(
      '<pending-slot data-spec-index="INDEX_PLACEHOLDER" data-pending-index="0">',
    )
    // 原始 JSON 被占位符替换隔离
    expect(r.content).not.toContain('磨')
  })

  it('未闭合空代码块 → pending（防流式初期闪烁）', () => {
    const r = detector.extractSpecs('正文\n```json\n')
    expect(r.status).toBe('pending')
    expect(r.content).toContain('<pending-slot')
  })

  it('非 Spec 代码块 → none 原样保留', () => {
    const r = detector.extractSpecs('```js\nconsole.log(1)\n```')
    expect(r.status).toBe('none')
    expect(r.content).toBeUndefined()
  })

  it('闭合但不像 Spec 前缀的代码块 → none', () => {
    const r = detector.extractSpecs('```json\n{"foo": 1}\n```')
    expect(r.status).toBe('none')
  })

  it('未闭合且不像 Spec 前缀 → none', () => {
    const r = detector.extractSpecs('```json\n{"foo": 1')
    expect(r.status).toBe('none')
  })

  it('多个 Spec 代码块 → 全部替换', () => {
    const text = `\`\`\`json\n${tableSpec}\n\`\`\`\n中间文本\n\`\`\`json\n{"key":"cx-text","data":{"text":"你好"}}\n\`\`\``
    const r = detector.extractSpecs(text)
    expect(r.status).toBe('success')
    expect(r.specs).toHaveLength(2)
    expect((r.content!.match(/<widget-slot/g) ?? []).length).toBe(2)
    expect(r.content).toContain('中间文本')
  })

  it('闭合 spec + 未闭合块混合 → success 且两种占位符并存', () => {
    const partial = '{"key":"cx-text","data":{'
    const text = `\`\`\`json\n${tableSpec}\n\`\`\`\n\`\`\`json\n${partial}`
    const r = detector.extractSpecs(text)
    expect(r.status).toBe('success')
    expect(r.specs).toHaveLength(1)
    expect(r.content).toContain('<widget-slot')
    expect(r.content).toContain('<pending-slot')
    expect(r.pendingSources).toEqual([partial])
  })

  it('破损但可修复的 JSON（尾逗号）', () => {
    const r = detector.extractSpecs('```json\n{"key":"cx-text","data":{"text":"你好",}}\n```')
    expect(r.status).toBe('success')
    expect((r.specs[0] as CxStreamNode).key).toBe('cx-text')
  })

  it('裸 JSON 兜底（无代码块包裹）', () => {
    const r = detector.extractSpecs(`结果 ${tableSpec} 完毕`)
    expect(r.status).toBe('success')
    expect(r.content).toContain('<widget-slot')
    expect(r.content).toContain('结果 ')
    expect(r.content).toContain(' 完毕')
  })

  it('未闭合裸 JSON → none（无法与普通文本区分）', () => {
    const r = detector.extractSpecs('前缀 {"key":"cx-text","data":{')
    expect(r.status).toBe('none')
  })

  it('数组根被接受', () => {
    const r = detector.extractSpecs(
      '```json\n[{"key":"cx-text","data":{"text":"甲"}},{"key":"cx-text","data":{"text":"乙"}}]\n```',
    )
    expect(r.status).toBe('success')
    expect(Array.isArray(r.specs[0])).toBe(true)
    expect(r.content).toContain('data-spec-key="cx-text"')
  })

  it('单引号 JSON 不识别为 Spec（收紧至标准 JSON，与 core 扫描器一致）', () => {
    const r = detector.extractSpecs("```json\n{'key':'cx-text','data':{}}\n```")
    expect(r.status).toBe('none')
  })

  it('占位标签名可配置', () => {
    const d2 = createSpecDetector({
      ...cxSpecDetectorConfig,
      widgetTag: 'my-widget',
      pendingTag: 'my-pending',
    })
    const r = d2.extractSpecs(`\`\`\`json\n${tableSpec}\n\`\`\``)
    expect(r.content).toContain('<my-widget')
    const rPending = d2.extractSpecs('```json\n{"key":"cx-text","data":{')
    expect(rPending.content).toContain('<my-pending')
  })
})
