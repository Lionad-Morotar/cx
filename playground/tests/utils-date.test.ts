import { describe, expect, it } from 'vitest'
import { generateDay, getDayRange, dayjs, dayStr } from '../app/standup/utils/date'

// 日期序列是站会列表分组与填充空会议日的底层机制
describe('generateDay', () => {
  it('next 方向：左闭右开，到 to 前一日停止', () => {
    const days = [...generateDay('2026-07-01', 'next', '2026-07-04')].map(dayStr)
    expect(days).toEqual(['2026-07-01', '2026-07-02', '2026-07-03'])
  })

  it('prev 方向：逆序向左，到 to 后一日停止', () => {
    const days = [...generateDay('2026-07-04', 'prev', '2026-07-01')].map(dayStr)
    expect(days).toEqual(['2026-07-04', '2026-07-03', '2026-07-02'])
  })

  it('非法区间直接抛错', () => {
    expect(() => [...generateDay('2026-07-04', 'next', '2026-07-01')]).toThrow(/illegal range/)
  })

  it('无 to 时为无限生成器，调用方自行截断', () => {
    const gen = generateDay('2026-07-01', 'next')
    const first = gen.next().value
    expect(dayStr(first)).toBe('2026-07-01')
  })
})

describe('getDayRange', () => {
  it('闭区间取天序列', () => {
    const days = getDayRange('2026-07-01', 'next', '2026-07-03').map(dayStr)
    expect(days).toEqual(['2026-07-01', '2026-07-02', '2026-07-03'])
  })
})

describe('dayjs 全局实例', () => {
  it('zh-cn locale 与 weekday 插件已配置', () => {
    expect(dayjs('2026-07-19').locale()).toBe('zh-cn')
    // zh-cn weekStart=1：周一 weekday()=0、周日 weekday()=6
    expect(dayjs('2026-07-19').weekday()).toBe(6)
    expect(dayjs('2026-07-20').weekday()).toBe(0)
  })
})
