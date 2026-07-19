// @ts-nocheck —— vendored nuxt-ui v2 第三方源码（MIT），按原版携带，不参与类型质量门
import { useClipboard } from '@vueuse/core'
import type { Notification } from '../types/notification'
import { useToast } from './useToast'

export function useCopyToClipboard(options: Partial<Notification> = {}) {
  const { copy: copyToClipboard, isSupported } = useClipboard()
  const toast = useToast()

  function copy(text: string, success: { title?: string, description?: string } = {}, failure: { title?: string, description?: string } = {}) {
    if (!isSupported) {
      return
    }

    copyToClipboard(text).then(() => {
      if (!success.title && !success.description) {
        return
      }

      toast.add({ ...success, ...options })
    }, function (e) {
      toast.add({
        ...failure,
        description: failure.description || e.message,
        ...options
      })
    })
  }

  return {
    copy
  }
}
