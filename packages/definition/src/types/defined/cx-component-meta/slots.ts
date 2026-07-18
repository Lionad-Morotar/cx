import type { CxArg } from './runtime'
import type { CxComponentRuntime, CxLoaderInstance, CxPropCTX } from '../../../index'

export type CxComponentMetaSlots =
  | ((ctx: CxPropCTX & { cx: CxLoaderInstance }) => ConfigMatcher[])
  | Record<string, ConfigMatcher>
  | ConfigMatcher[]

type ConfigMatcher = CxComponentSlotBase | ((cmpt: CxComponentRuntime) => CxComponentSlotBase)

export type CxComponentSlotBase = {
  key: string
  name: string
  description?: string
  icon?: string
  binds?: Record<string, CxArg>
}

// 这样实现的话，通过 CxComponentRuntime['aliasKeys'] 可以逃逸规则
type SlotRule =
  | { whitelist?: CxComponentRuntime['key']; blacklist?: never }
  | { blacklist?: CxComponentRuntime['key']; whitelist?: never }
  | { whitelist?: never; blacklist?: never }

export type CxComponentSlot = CxComponentSlotBase & SlotRule
