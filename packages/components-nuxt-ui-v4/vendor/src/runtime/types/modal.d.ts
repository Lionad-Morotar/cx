// @ts-nocheck —— vendored nuxt-ui v2 第三方源码（MIT），按原版携带，不参与类型质量门
import type { Component } from 'vue'

export interface Modal {
  appear?: boolean
  overlay?: boolean
  transition?: boolean
  preventClose?: boolean
  fullscreen?: boolean
  class?: string | object | string[]
  ui?: any
  onClose?: () => void
  onClosePrevented?: () => void
}

export interface ModalState {
  component: Component | string
  props: Modal
}
