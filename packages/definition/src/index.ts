import * as _cxConfigs from './configs'
import * as _cxEvents from './events'
import * as _cxHelper from './helper'
import * as _cxNormalize from './define'
import * as _cxHooks from './hooks'
import * as _cxLoader from './loader'
import * as _cxUtils from './utils'
import * as _cxGuards from './guards'

export * from './configs'
export * from './events'
export * from './helper'
export * from './define'
export * from './hooks'
export * from './loader'
export * from './utils'
export * from './types'
export * from './guards'

/**
 * legacy 兼容形态：p-ray 时代以 default 聚合对象消费。
 * 命名导出已全覆盖，后续治理阶段评估废弃（default 聚合对 tree-shaking 不友好）。
 */
export default {
  ..._cxConfigs,
  ..._cxEvents,
  ..._cxHelper,
  ..._cxNormalize,
  ..._cxHooks,
  ..._cxLoader,
  ..._cxUtils,
  ..._cxGuards,
}
