// @ts-nocheck —— vendored nuxt-ui v2 第三方源码（MIT），按原版携带，不参与类型质量门
import type { chip } from '../ui.config'
import type colors from '#ui-colors'

export type ChipSize = keyof typeof chip.size
export type ChipColor = 'gray' | typeof colors[number]
export type ChipPosition = keyof typeof chip.position

export interface Chip {
  size?: ChipSize
  color?: ChipColor
  position?: ChipPosition
  text?: string
  inset?: boolean
  show?: boolean
}
