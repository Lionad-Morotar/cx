declare module 'deindent' {
  export default any
}
declare module 'html-escaper' {
  export const escape: any
  export const unescape: any
}
declare module 'number-to-chinese-words' {
  export const toWords: (num: number | string) => string
  export default {
    toWords,
  }
}
// chinese-workday 新版 ESM flat exports 声明
declare module 'chinese-workday' {
  import type { Dayjs } from 'dayjs'
  type DayLike = string | Date | Dayjs
  export const isWorkday: (day: DayLike) => boolean
  export const isHoliday: (day: DayLike) => boolean
  export const getFestival: (day: DayLike) => string
  export const isWeekend: (day: DayLike) => boolean
  export const isAddtionalWorkday: (day: DayLike) => boolean
  export const nextWorkday: (day: DayLike) => Dayjs
  export const previousWorkday: (day: DayLike) => Dayjs
  export const countWorkdays: (start: DayLike, end: DayLike) => number
  export const getWorkdaysInRange: (start: DayLike, end: DayLike) => Dayjs[]
  export const getHolidaysInRange: (start: DayLike, end: DayLike) => Dayjs[]
}
