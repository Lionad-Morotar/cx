// el-plus @element-plus/constants 最小子集（仅 el-calendar 依赖）

// 事件名常量
export const INPUT_EVENT = 'input'
export const UPDATE_MODEL_EVENT = 'update:modelValue'

// 星期 key：原值为英文缩写，由 locale 翻译成中文，顺序与 el-plus 一致
export const WEEK_DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const
