import def from './index'

import type { ArrayTriggerConfig } from '@lionad/cx-stream'

/**
 * 标签页流式增量规则。
 * 主数组为标签项 data.items（label/value/icon），逐项流式即可渐进铺出标签栏。
 */
const config: ArrayTriggerConfig = {
  key: def._cx_meta.key,
  arrayKey: 'items',
}

export default config
