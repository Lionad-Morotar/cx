import def from './index'

import type { StreamTriggerConfig } from '@lionad/cx-stream'

/**
 * 轮播流式增量规则。
 * 主数组为轮播项 data.items（v4 必需的数据源），逐项流式即可渐进铺出轮播。
 */
const config: StreamTriggerConfig = {
  key: def._cx_meta.key,
  sections: [{ kind: 'array', arrayKey: 'items' }],
}

export default config
