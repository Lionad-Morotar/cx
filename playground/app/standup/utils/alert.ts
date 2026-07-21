/**
 * 轻量报错提示（原 ElMessageBox 确认弹窗，清退 element-plus 后暂降级为 console）。
 *
 * 暂降级原因：playground 经 cx-nuxt 用 vendored nuxt-ui 物料，未直接依赖 @nuxt/ui，
 * 故 useToast/useOverlay 等 nuxt-ui composable 不可用；util（非组件）用 useCxToast
 * 的 inject 通道也无效。先以 console 保底（清退 element-plus），toast 服务桥
 * （playground 装 @nuxt/ui 或建全局 toast 服务）后续独立接入。
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
