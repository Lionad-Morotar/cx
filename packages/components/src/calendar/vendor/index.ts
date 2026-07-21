// el-calendar vendor 出口
// 从 element-plus@2.14.3 内化（packages/components/calendar/src），逻辑原样保留，
// 仅将 @element-plus/* 的 import 改写为本地 ../shims/*，使 cx-calendar 脱离 element-plus 依赖。
export { default as ElCalendar } from './el-calendar/calendar.vue'
export * from './el-calendar/calendar'
