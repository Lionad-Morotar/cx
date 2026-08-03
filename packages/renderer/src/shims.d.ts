// 构建期模块声明：样式副作用导入（产物为 dist/style.css，消费者不经 TS 解析）
declare module '*.scss'
declare module '*.css'

// 全局调试标记：宿主页面 console 手动挂载（如 window._debug = true）开启渲染链路日志，
// SSR 环境无 window，引用处均有环境守卫
interface Window {
  _debug?: unknown
  _debug_verbose?: unknown
}
