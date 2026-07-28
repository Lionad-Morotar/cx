import { zip } from 'lodash-es'
import dayjs_ from 'dayjs'
import weekday from 'dayjs/plugin/weekday'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import zhcn from 'dayjs/locale/zh-cn'

import type { Dayjs } from 'dayjs'

type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6

dayjs_.extend(weekday)
dayjs_.extend(isSameOrAfter)
dayjs_.extend(isSameOrBefore)
dayjs_.locale(zhcn, undefined, true)
dayjs_.locale('zh-cn')

export const dayStr = (x?: Dayjs | string | number) => dayjs_(x).format('YYYY-MM-DD')

export const timeStr = (x?: Dayjs | string | number) => dayjs_(x).format('YYYY-MM-DD HH:mm:ss')

export const timeRangeMeterStr = (s: string) => {
  return (
    {
      year: '年',
      month: '月',
      week: '周',
      day: '天',
      hour: '小时',
      minute: '分钟',
      second: '秒',
    }[s] || ''
  )
}

export const genSecondToManString =
  (meters = ['d', 'h', 'm', 's']) =>
  (input: number | string, keepDigit = 0, valLen = 2) => {
    const s = +input
    const useDigits = (n: number) => {
      const d = parseFloat(String(n))
      const [int = '0', digits = ''] = String(d).split('.')
      const digitsRemain = digits.slice(0, keepDigit)
      const all = [int, digitsRemain].filter(Boolean).join('.')
      return [all, int, digitsRemain, digits]
    }
    const [day] = useDigits(s / 60 / 60 / 24)
    const [hour] = useDigits((s / 60 / 60) % 24)
    const [minute] = useDigits((s / 60) % 60)
    const [second] = useDigits(s % 60)

    const ziped = zip([day, hour, minute, second], meters)
    const res = ziped
      .filter(([value]) => +(value || 0) !== 0)
      .map((x) => x.join(''))
      .join('')
      .replace(new RegExp(`(([0-9.]+(${meters.join('|')})){0,${valLen}}).*`, 'g'), '$1')
    return res || '0s'
  }

export const secondToManString = genSecondToManString()
export const secondToManStringCN = genSecondToManString(['天', '小时', '分钟', '秒'])

export const weekdayStrIDX = (idx: number) => {
  const weekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] as const
  return weekdays[idx]
}

export const weekdayStr = (x?: Dayjs | string | number) => {
  const weekday = dayjs_(x).weekday()
  return weekdayStrIDX(weekday)
}

export const weekdayStrEN = (x?: Dayjs | string | number, short = false) => {
  const weekday = dayjs_(x).weekday()
  const weekdays = short
    ? ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun']
    : (['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const)
  return weekdays[weekday]
}

export const monthStrIDX = (idx: number) => {
  const months = [
    '一月',
    '二月',
    '三月',
    '四月',
    '五月',
    '六月',
    '七月',
    '八月',
    '九月',
    '十月',
    '十一月',
    '十二月',
  ] as const
  return months[idx]
}

/**
 * 生成 dayjs 日期，左闭右开
 * @usage https://stackblitz.com/edit/typescript-7hcy6e?file=index.ts
 */
export function* generateDay(
  from: Dayjs | string = dayjs_(),
  direction: 'prev' | 'next' = 'next',
  to: Dayjs | string | null = null,
  step?: 'day' | 'week' | 'month' | 'year',
) {
  const toDay = to ? dayjs_(to) : null
  let day = dayjs_(from)

  if (toDay) {
    if (
      (direction === 'next' && day.isAfter(toDay)) ||
      (direction === 'prev' && day.isBefore(toDay))
    ) {
      throw new Error(`illegal range from ${dayStr(day)} to ${dayStr(toDay)}`)
    }
  }

  while (true) {
    yield day
    const offset = direction === 'prev' ? -1 : 1
    const checkMethod = direction === 'prev' ? 'isSameOrBefore' : 'isSameOrAfter'
    day = day.add(offset, step || 'day')
    if (toDay && day[checkMethod](toDay)) {
      break
    }
  }
}
export function getDayRange(
  from: Dayjs | string = dayjs_(),
  direction: 'prev' | 'next' = 'next',
  to: Dayjs | string | null,
  limit = 5000,
) {
  const fromDay = dayjs_(from)
  const toDay = dayjs_(to)
  const result = []
  let count = 0
  const countMeter = direction === 'prev' ? -1 : 1
  while (true) {
    const cur = fromDay.add(count, 'day')
    if (Math.abs(count) > limit) {
      throw new Error(`[ERR] dead in getDayRange, iter times bt ${limit}`)
    }
    if (
      (direction === 'prev' && cur.isBefore(toDay, 'day')) ||
      (direction === 'next' && cur.isAfter(toDay, 'day'))
    ) {
      break
    } else {
      result.push(cur)
      count += countMeter
    }
  }
  return result
}

export const dayjs = dayjs_
