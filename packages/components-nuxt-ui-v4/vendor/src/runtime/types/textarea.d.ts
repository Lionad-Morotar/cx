// @ts-nocheck —— vendored nuxt-ui v2 第三方源码（MIT），按原版携带，不参与类型质量门
import type { AppConfig } from 'nuxt/schema'
import type { textarea } from '../ui.config'
import type { NestedKeyOf, ExtractDeepKey, ExtractDeepObject } from '.'
import type colors from '#ui-colors'

export type TextareaSize = keyof typeof textarea.size | ExtractDeepKey<AppConfig, ['ui', 'textarea', 'size']>
export type TextareaColor = keyof typeof textarea.color | ExtractDeepKey<AppConfig, ['ui', 'textarea', 'color']> | typeof colors[number]
export type TextareaVariant = keyof typeof textarea.variant | ExtractDeepKey<AppConfig, ['ui', 'textarea', 'variant']> | NestedKeyOf<typeof textarea.color> | NestedKeyOf<ExtractDeepObject<AppConfig, ['ui', 'textarea', 'color']>>
