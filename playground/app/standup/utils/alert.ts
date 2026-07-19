/**
 * 轻量确认弹窗（ElMessageBox 封装），用于 dashboard 缺参报错页
 *
 * 原用法：alert({ title, content, showClose: false })，仅用于 dashboard 缺参报错页
 */
import { ElMessageBox } from 'element-plus'

export interface CxAlertOptions {
  title: string
  content?: string
  showClose?: boolean
  confirmButtonText?: string
}

export function cxAlert(options: CxAlertOptions) {
  return ElMessageBox.alert(options.content ?? '', options.title, {
    showClose: options.showClose ?? true,
    confirmButtonText: options.confirmButtonText ?? '确定',
  })
}
