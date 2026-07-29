// @ts-nocheck —— vendored nuxt-ui v2 第三方源码（MIT），按原版携带，不参与类型质量门
import type { AppConfig } from 'nuxt/schema'
import type { formGroup } from '../ui.config'
import type { ExtractDeepKey } from '.'

export type FormGroupSize = keyof typeof formGroup.size | ExtractDeepKey<AppConfig, ['ui', 'formGroup', 'size']>
