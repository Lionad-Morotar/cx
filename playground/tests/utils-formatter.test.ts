import { describe, expect, it } from 'vitest'
import { isEmpty, fallback, toCNNumber } from '../app/standup/utils/formatter'

// formatter 的空值契约：站会渲染层把 '-'、'/'、'未知' 也视为空
describe('isEmpty', () => {
  it('判空：null / undefined / 空串 / 0 / false', () => {
    expect(isEmpty(null)).toBe(true)
    expect(isEmpty(undefined)).toBe(true)
    expect(isEmpty('')).toBe(true)
    expect(isEmpty(0)).toBe(true)
    expect(isEmpty(false)).toBe(true)
  })

  it('判空：占位符 "-"、"/"、"未知"', () => {
    expect(isEmpty('-')).toBe(true)
    expect(isEmpty('/')).toBe(true)
    expect(isEmpty('未知')).toBe(true)
  })

  it('非空：正常字符串与数字', () => {
    expect(isEmpty('正常')).toBe(false)
    expect(isEmpty('0')).toBe(false)
    expect(isEmpty(1)).toBe(false)
  })
})

describe('fallback', () => {
  it('空值回退到默认 "-"，可自定义占位', () => {
    expect(fallback('')).toBe('-')
    expect(fallback(null, 'N/A')).toBe('N/A')
    expect(fallback('有值')).toBe('有值')
  })

  it('子方法：url / label / xs', () => {
    expect(fallback.url('')).toBe('/')
    expect(fallback.label('')).toBe('未知')
    expect(fallback.xs(null)).toEqual([])
  })
})

describe('toCNNumber', () => {
  it('数字转中文大写', () => {
    expect(toCNNumber(3)).toBe('三')
    expect(toCNNumber(12)).toBe('十二')
  })
})
