// el-plus @element-plus/utils 最小子集（仅 el-calendar 依赖）
// 类型守卫与 props 构建器；逻辑对齐 el-plus 原生实现，避免 lodash 语义差异

export const isArray = Array.isArray

export const isDate = (val: unknown): val is Date =>
  Object.prototype.toString.call(val) === '[object Date]'

export const isObject = (val: unknown): val is Record<string, any> =>
  typeof val === 'object' && val !== null

export const isString = (val: unknown): val is string => typeof val === 'string'

export const isFunction = (val: unknown): val is (...args: any[]) => any =>
  typeof val === 'function'

/**
 * buildProps 原样透传。
 * Why: calendar 系列组件用 defineProps<CalendarProps>() 类型形式，
 * buildProps 产物（calendarProps 等）为 deprecated 导出，运行时不被组件消费，
 * 无需复刻 el-plus 的运行时元信息（__elPropsReserved 等）。
 */
export const buildProps = <T>(props: T): T => props

// definePropType：原样返回构造器，T 仅用于调用方的类型标注（如 definePropType<Dayjs>(Object)），
// 与 el-plus 原版签名一致；运行时为恒等函数
export const definePropType = <T>(val: any): T => val

// el-plus debugWarn 降级为 console.warn；scope 通常为组件名
export const debugWarn = (scope: string, message: string): void => {
  console.warn(`[${scope}] ${message}`)
}
