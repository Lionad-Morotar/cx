// @ts-nocheck —— vendored nuxt-ui v2 第三方源码（MIT），按原版携带，不参与类型质量门
import type { AppConfig } from 'nuxt/schema'
import type { avatar } from '../ui.config'
import type { ExtractDeepKey } from '.'
import type colors from '#ui-colors'

export type AvatarSize = keyof typeof avatar.size | ExtractDeepKey<AppConfig, ['ui', 'avatar', 'size']>
export type AvatarChipColor = 'gray' | typeof colors[number]
export type AvatarChipPosition = keyof typeof avatar.chip.position

export interface Avatar {
  src?: string | boolean
  alt?: string
  text?: string
  size?: AvatarSize
  chipColor?: AvatarChipColor
  chipPosition?: AvatarChipPosition
}
