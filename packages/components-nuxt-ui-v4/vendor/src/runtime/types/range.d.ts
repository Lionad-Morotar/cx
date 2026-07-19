// @ts-nocheck —— vendored nuxt-ui v2 第三方源码（MIT），按原版携带，不参与类型质量门
import type { AppConfig } from 'nuxt/schema'
import type { range } from '../ui.config'
import type { ExtractDeepKey } from '.'
import type colors from '#ui-colors'

export type RangeSize = keyof typeof range.size | ExtractDeepKey<AppConfig, ['ui', 'range', 'size']>
export type RangeColor = typeof colors[number]
