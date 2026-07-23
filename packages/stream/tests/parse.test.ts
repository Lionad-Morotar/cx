import { describe, expect, it } from 'vitest'
import { safeJsonParse } from '../src/core/parse'

describe('safeJsonParse', () => {
  it('合法 JSON 原样解析', () => {
    expect(safeJsonParse('{"a":1}')).toEqual({ a: 1 })
  })

  it('修复尾逗号', () => {
    expect(safeJsonParse('{"a":1,}')).toEqual({ a: 1 })
  })

  it('修复缺失的闭合括号（流式截断）', () => {
    expect(safeJsonParse('{"a":{"b":1')).toEqual({ a: { b: 1 } })
  })

  it('超限且解析失败：内存保护抛错', () => {
    const bigBroken = `{"a": "${'x'.repeat(150_000)}`
    expect(() => safeJsonParse(bigBroken)).toThrow(/too large/)
  })

  it('maxRepairLength 可配置', () => {
    expect(() => safeJsonParse('{"a":', { maxRepairLength: 2 })).toThrow(/too large/)
  })
})
