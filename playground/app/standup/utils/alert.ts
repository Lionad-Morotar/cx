/**
 * 轻量报错提示（原 ElMessageBox 确认弹窗，清退 element-plus 后暂降级为 console）。
 *
 * 暂降级原因：本 util 在组件 setup 之外被调用，拿不到 UApp 注入的
 * toaster/overlay 上下文，useToast/useOverlay 在此不可用（组件内可用）；
 * useCxToast 的 inject 通道同理。先以 console 保底，确认弹窗待后续接
 * useOverlay 或全局服务。
 */
export interface CxAlertOptions {
  title: string
  content?: string
  showClose?: boolean
  confirmButtonText?: string
}

export function cxAlert(options: CxAlertOptions) {
  console.warn(`[cxAlert] ${options.title}${options.content ? ': ' + options.content : ''}`)
  return Promise.resolve()
}
