// @ts-nocheck —— vendored nuxt-ui v2 第三方源码（MIT），按原版携带，不参与类型质量门
import type { Component } from 'vue'

export interface Slideover {
  ui?: any
  side?: 'right' | 'left'
  transition?: boolean
  appear?: boolean
  overlay?: boolean
  preventClose?: boolean
  modelValue?: boolean
}

export interface SlideoverState {
  component: Component | string
  props: Slideover
}
