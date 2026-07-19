/**
 * 工作日判定的容错包装
 *
 * chinese-workday 新版对 Invalid Date 直接抛错，而旧版容错返回 false；
 * 迁移代码的"昨天=向前找最近工作日"循环依赖旧容错语义，此处对齐
 */
import {
  isWorkday as _isWorkday,
  isHoliday as _isHoliday,
  getFestival as _getFestival,
} from 'chinese-workday'

type DayLike = string | Date

export const isWorkday = (day: DayLike): boolean => {
  try {
    return _isWorkday(day)
  } catch {
    return false
  }
}

export const isHoliday = (day: DayLike): boolean => {
  try {
    return _isHoliday(day)
  } catch {
    return false
  }
}

export const getFestival = (day: DayLike): string => {
  try {
    return _getFestival(day)
  } catch {
    return ''
  }
}
