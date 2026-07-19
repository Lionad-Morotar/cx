import dayjs_ from 'dayjs'
import weekday from 'dayjs/plugin/weekday'
import duration from 'dayjs/plugin/duration'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import relativeTime from 'dayjs/plugin/relativeTime'
import zhCn from 'dayjs/locale/zh-cn'

dayjs_.extend(weekday)
dayjs_.extend(duration)
dayjs_.extend(isSameOrAfter)
dayjs_.extend(isSameOrBefore)
dayjs_.extend(relativeTime)
dayjs_.locale(zhCn, undefined, true)
dayjs_.locale('zh-cn')

/** 配置了 zh-cn 与常用插件的 dayjs（原为 p-ray utils/date/dayjs 的 Time） */
export const dayjs = dayjs_
export const Time = dayjs
export default dayjs
