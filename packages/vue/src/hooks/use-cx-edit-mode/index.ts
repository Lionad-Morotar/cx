import type { AnyFn } from '@vueuse/core'
import { computed, unref, inject } from 'vue'
import { whenever } from '@vueuse/core'

// 当 cx-render 组件处于编辑模式时执行函数
export const useCxEditMode = (fn: AnyFn) => {
  const isEditMode = computed(() => unref(inject('is-cx-edit', false)))
  const stop = whenever(isEditMode, fn, {
    immediate: true,
  })
  return {
    isEditMode,
    stop,
  }
}
