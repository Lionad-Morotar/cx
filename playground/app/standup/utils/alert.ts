import { useOverlay } from '#imports'

import CxAlertDialog from '../components/cx-alert-dialog.vue'

/**
 * 轻量确认弹窗（ElMessageBox 替代）：经 @nuxt/ui v4 useOverlay 程序化唤起 UModal。
 *
 * useOverlay 是全局共享单例（createSharedComposable），util 层可直接调用；
 * 渲染依赖 app.vue 的 UApp（OverlayProvider），其未挂载时退化为 console 保底。
 */
export interface CxAlertOptions {
  title: string
  content?: string
  showClose?: boolean
  confirmButtonText?: string
}

let alertModal: ReturnType<ReturnType<typeof useOverlay>['create']> | null = null

/** 确认 resolve(true)；X / ESC / 遮罩关闭 resolve(false) */
export function cxAlert(options: CxAlertOptions): Promise<boolean> {
  try {
    if (!alertModal) {
      alertModal = useOverlay().create(CxAlertDialog)
    }
    return alertModal.open({
      title: options.title,
      content: options.content,
      showClose: options.showClose,
      confirmButtonText: options.confirmButtonText,
    })
  } catch (error) {
    console.warn(
      `[cxAlert] ${options.title}${options.content ? ': ' + options.content : ''}`,
      error,
    )
    return Promise.resolve(false)
  }
}
