// @ts-nocheck —— vendored nuxt-ui v2 第三方源码（MIT），按原版携带，不参与类型质量门
import type { Placement, PositioningStrategy } from '@popperjs/core'

export interface PopperOptions {
  // Workaround for weak types: https://mariusschulz.com/blog/weak-type-detection-in-typescript#workarounds-for-weak-types
  [key: string]: unknown
  locked?: boolean
  overflowPadding?: number
  offsetDistance?: number
  offsetSkid?: number
  placement?: Placement
  strategy?: PositioningStrategy
  gpuAcceleration?: boolean
  adaptive?: boolean
  scroll?: boolean
  resize?: boolean
  arrow?: boolean
}
