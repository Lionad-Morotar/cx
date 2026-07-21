// el-plus @element-plus/components/time-picker 最小子集（仅 el-calendar 依赖）

// 默认日期格式：data.day 以此序列化为 'YYYY-MM-DD'，供 date-cell slot 消费
export const DEFAULT_FORMATS_DATE = 'YYYY-MM-DD'

// 返回 [0, 1, ..., n-1]；n <= 0 时为空数组，对齐 el-plus rangeArr
export const rangeArr = (n: number): number[] => Array.from({ length: Math.max(n, 0) }, (_, i) => i)
