import { describe, expect, it } from 'vitest'
import { degradeUnclosedSpecFences } from '../src/core/fallback'
import { createSpecDetector } from '../src/core/spec-detector'
import { cxSpecDetectorConfig } from '../src/cx'

const looksLikeSpecPrefix = cxSpecDetectorConfig.looksLikeSpecPrefix

const config = { fence: 'json', looksLikeSpecPrefix }

const tableSpec = `{"id":"t1","key":"cx-demo-table","data":{"columns":[{"key":"name","label":"名称"}],"rows":[{"name":"磨床"}]}}`

// 断在字符串值中段：可提取出「正在生成磨床清单」作为部分人话摘要
const partial = `{"id":"t1","key":"cx-demo-table","data":{"title":"正在生成磨床清单"`

describe('degradeUnclosedSpecFences', () => {
  it('已闭合围栏原样保留', () => {
    const text = `查询结果如下：\n\`\`\`json\n${tableSpec}\n\`\`\`\n以上是结果。`
    expect(degradeUnclosedSpecFences(text, config)).toBe(text)
  })

  it('未闭合 spec 围栏降级为摘要 + 中断提示，原始 JSON 不外泄', () => {
    const out = degradeUnclosedSpecFences(`\`\`\`json\n${partial}`, config)
    expect(out).toBe('正在生成磨床清单\n⚠️ 内容生成中断')
    expect(out).not.toContain('cx-demo-table')
    expect(out).not.toContain('"')
    expect(out).not.toContain('```')
  })

  it('非 spec 的未闭合代码块原样保留', () => {
    const js = '```js\nconsole.log(1)'
    expect(degradeUnclosedSpecFences(js, config)).toBe(js)
    // 语言标记命中但内容不像 spec 前缀：与 spec-detector 的 pending 判定同规
    const jsonish = '```json\nconst config = { a: 1'
    expect(degradeUnclosedSpecFences(jsonish, config)).toBe(jsonish)
  })

  it('混合文本：闭合围栏保留与未闭合围栏降级并存', () => {
    const text = `前文\n\`\`\`json\n${tableSpec}\n\`\`\`\n中段\n\`\`\`json\n${partial}`
    const out = degradeUnclosedSpecFences(text, config)
    expect(out).toBe(
      `前文\n\`\`\`json\n${tableSpec}\n\`\`\`\n中段\n正在生成磨床清单\n⚠️ 内容生成中断`,
    )
  })

  it('空围栏降级为仅中断提示（防流式初期闪烁的同语义）', () => {
    expect(degradeUnclosedSpecFences('正文\n```json\n', config)).toBe('正文\n⚠️ 内容生成中断')
  })

  it('人话摘要提取为空时仅输出中断提示', () => {
    // '{"key"' 像 spec 前缀但无可提取文本值，且句级回退亦无句子无键名可挂
    expect(degradeUnclosedSpecFences('```json\n{"key"', config)).toBe('⚠️ 内容生成中断')
  })

  it('fence 数组两路围栏均参与判定，未列入标记原样保留', () => {
    const dual = { ...config, fence: ['json', 'jsonc'] }
    const jsonc = '```jsonc\n{"key":"cx-text","data":{"text":"表格生成中"'
    expect(degradeUnclosedSpecFences(jsonc, dual)).toBe('表格生成中\n⚠️ 内容生成中断')

    // 混合多块按文档序逐块处理：闭合 json 保留、未闭合 jsonc 降级
    const mixed = `\`\`\`json\n${tableSpec}\n\`\`\`\n中段\n\`\`\`jsonc\n{"key":"cx-text","data":{"text":"表格生成中"`
    const out = degradeUnclosedSpecFences(mixed, dual)
    expect(out).toBe(`\`\`\`json\n${tableSpec}\n\`\`\`\n中段\n表格生成中\n⚠️ 内容生成中断`)

    // 未列入标记的未闭合围栏按非 spec 代码块处理，与 pending 隔离同规
    const json5 = '```json5\n{"key":"cx-text","data":{'
    expect(degradeUnclosedSpecFences(json5, dual)).toBe(json5)
  })

  it('notice 可注入平台常量覆盖缺省文案', () => {
    const custom = { ...config, notice: '【生成已中断】' }
    expect(degradeUnclosedSpecFences(`\`\`\`json\n${partial}`, custom)).toBe(
      '正在生成磨床清单\n【生成已中断】',
    )
  })

  it('句级回退拒判 JSON 语法痕迹：无干净句只产中断提示，原始 JSON 不外泄', () => {
    // "a." 的句点被误判为句界时，候选句 {"id":"a. 属原始 JSON 语法，须整句拒判
    const out = degradeUnclosedSpecFences('```json\n{"id":"a.","key":"cx-demo-table"', config)
    expect(out).toBe('⚠️ 内容生成中断')
    expect(out).not.toContain('"')
    expect(out).not.toContain('{')
  })

  it('裸英文键名不作摘要：无 meaningful 值时只产中断提示', () => {
    // 键名兜底产出的 "data" 是技术标识而非人话
    expect(degradeUnclosedSpecFences('```json\n{"key":"cx-text","data":', config)).toBe(
      '⚠️ 内容生成中断',
    )
  })
})

describe('pending 判定同源守护（spec-detector ⟷ fallback）', () => {
  const detector = createSpecDetector(cxSpecDetectorConfig)

  // 两侧判定必须一致：fallback 降级 ⟺ detector pending。参数化用例锁住
  // isPendingSpecFenceBlock 单一实现被两侧同源消费的契约，防复制漂移复发
  const cases: Array<[string, string]> = [
    ['空内容未闭合围栏两侧均按 pending 处理', '正文\n```json\n'],
    ['spec 前缀未闭合围栏两侧均按 pending 处理', '```json\n{"id":"t1","key":"cx-demo-table"'],
    ['非 spec 未闭合代码块两侧均原样保留', '```json\nconst config = { a: 1'],
    ['已闭合 spec 围栏两侧均不按 pending 处理', '```json\n' + tableSpec + '\n```'],
    ['已闭合非 spec 围栏两侧均不按 pending 处理', '```js\nconsole.log(1)\n```'],
  ]

  for (const [name, text] of cases) {
    it(name, () => {
      const degraded = degradeUnclosedSpecFences(text, config) !== text
      expect(degraded).toBe(detector.extractSpecs(text).status === 'pending')
    })
  }
})
