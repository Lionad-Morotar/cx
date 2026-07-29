// @ts-nocheck —— vendored nuxt-ui v2 第三方源码（MIT），按原版携带，不参与类型质量门
import type { Avatar } from './avatar'
import type { NuxtLinkProps } from '#app'

export interface DropdownItem extends NuxtLinkProps {
  label: string
  labelClass?: string
  slot?: string
  icon?: string
  iconClass?: string
  avatar?: Avatar
  shortcuts?: string[]
  disabled?: boolean
  class?: string
  click?: (...args: any[]) => void
}
