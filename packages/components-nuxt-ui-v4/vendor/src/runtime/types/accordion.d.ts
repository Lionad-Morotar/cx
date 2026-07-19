// @ts-nocheck —— vendored nuxt-ui v2 第三方源码（MIT），按原版携带，不参与类型质量门
import type { Button } from './button'

export interface AccordionItem extends Button {
  slot?: string
  disabled?: boolean
  content?: string | string[] | object | object[]
  defaultOpen?: boolean
  closeOthers?: boolean
}
