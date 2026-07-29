// @ts-nocheck —— vendored nuxt-ui v2 第三方源码（MIT），按原版携带，不参与类型质量门
import type { meter } from '../ui.config'
import type colors from '#ui-colors'

export type MeterSize = keyof typeof meter.meter.size
export type MeterColor = keyof typeof meter.color | typeof colors[number]
