import def from './index'

import type { ArrayTriggerConfig } from '@lionad/cx-stream'

/**
 * 面包屑流式增量规则。
 * 主数组为面包屑项 data.items（label/icon/to），逐条流式即可渐进铺出路径。
 */
const config: ArrayTriggerConfig = {
  key: def._cx_meta.key,
  arrayKey: 'items',
}

export default config
