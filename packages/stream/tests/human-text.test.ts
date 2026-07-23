import { describe, expect, it } from 'vitest'
import {
  extractDisplayText,
  extractLastSentence,
  extractStructuredHumanText,
  funifyText,
  truncate,
} from '../src/core/human-text'
import { cxHumanTextConfig } from '../src/cx'

describe('truncate', () => {
  it('短文本不截断', () => {
    expect(truncate('短句', 20)).toBe('短句')
  })

  it('超长截断为 maxLen-1 + ...', () => {
    expect(truncate('x'.repeat(41))).toBe(`${'x'.repeat(39)}...`)
    expect(truncate('x'.repeat(40))).toBe('x'.repeat(40))
  })
})

describe('extractStructuredHumanText（cx 预设）', () => {
  it('cx 表格：提取含中文的 cell 值', () => {
    const input = `\`\`\`json
{"id":"booking","key":"cx-demo-table","data":{
  "columns":[{"key":"field","label":"确认项"},{"key":"detail","label":"详情"}],
  "rows":[
    {"field":"商机编号","detail":"OP-2026-0105"},
    {"field":"目标公司","detail":"越南北江新能源科技有限公司"}
  ]
}}
\`\`\``
    expect(extractStructuredHumanText(input, cxHumanTextConfig)).toBe('越南北江新能源科技有限公司')
  })

  it('截断 JSON：流式中途提取最后一个已闭合的值（未闭合尾部丢弃）', () => {
    const input =
      '{"id":"x","key":"cx-demo-table","data":{"rows":[{"name":"金融与宏观","desc":"宏观数据'
    // "宏观数据" 未闭合不可提取，命中上一个已闭合的中文值
    expect(extractStructuredHumanText(input, cxHumanTextConfig)).toBe('金融与宏观')
  })

  it('过滤技术性值：icon 协议与短 id 被排除', () => {
    const input = '{"key":"cx-menu","data":{"icon":"lucide:search","id":"srch","label":"政策查询"}}'
    expect(extractStructuredHumanText(input, cxHumanTextConfig)).toBe('政策查询')
  })

  it('无中文时返回最后一个有意义值', () => {
    const input =
      '{"key":"cx-card","data":{"title":"Hello World","description":"Some description here"}}'
    expect(extractStructuredHumanText(input, cxHumanTextConfig)).toBe('Some description here')
  })

  it('普通 markdown：不含 key 标记，返回 null', () => {
    expect(extractStructuredHumanText('你好，这是普通文本。', cxHumanTextConfig)).toBeNull()
  })

  it('空输入返回 null', () => {
    expect(extractStructuredHumanText('', cxHumanTextConfig)).toBeNull()
  })
})

describe('extractLastSentence', () => {
  it('提取中文句子', () => {
    expect(extractLastSentence('你好。世界。')).toBe('世界。')
    expect(extractLastSentence('这是第一句。这是第二句！')).toBe('这是第二句！')
  })

  it('提取英文句子', () => {
    expect(extractLastSentence('Hello world. This is a test.')).toBe('This is a test.')
  })

  it('多个点号不被当作多个句子边界', () => {
    expect(extractLastSentence('Loading...')).toBe('Loading.')
    expect(extractLastSentence('Data is loading... Please wait.')).toBe('Please wait.')
  })

  it('无边界时回退到最后一个 JSON key', () => {
    expect(extractLastSentence('{"key": "value"}')).toBe('key')
  })

  it('空文本返回 null', () => {
    expect(extractLastSentence('')).toBeNull()
  })
})

describe('extractDisplayText', () => {
  it('优先结构化字段值', () => {
    const input = '{"key":"cx-card","data":{"title":"卡片标题"}}'
    expect(extractDisplayText(input, cxHumanTextConfig)).toBe('卡片标题')
  })

  it('非结构化时从 markdown 提取句子', () => {
    expect(extractDisplayText('Hello world. **Bold** text.', cxHumanTextConfig)).toBe('Bold text.')
  })

  it('无任何内容时返回 null', () => {
    expect(extractDisplayText('', cxHumanTextConfig)).toBeNull()
  })
})

describe('funifyText', () => {
  const noRandom = () => 0.99 // 大于 0.5 → 不追加标点，便于确定性断言

  it('已有尾标点的文本原样返回', () => {
    expect(funifyText('正在处理。', { rand: noRandom })).toBe('正在处理。')
  })

  it('两字中文命中模板规则', () => {
    const out = funifyText('确认', { rand: () => 0 })
    expect(out).toBe('正在设置「确认」按钮...')
  })

  it('自定义规则注入', () => {
    const out = funifyText('SPECIAL', {
      rules: [{ match: /SPECIAL/, templates: [(m) => `<${m}>`] }],
      rand: () => 0,
    })
    expect(out).toBe('<SPECIAL>')
  })

  it('无规则命中且无尾标点：按随机追加标点', () => {
    expect(funifyText('处理中', { rand: () => 0 })).toBe('处理中!')
    expect(funifyText('处理中', { rand: () => 0.99 })).toBe('处理中')
  })
})
