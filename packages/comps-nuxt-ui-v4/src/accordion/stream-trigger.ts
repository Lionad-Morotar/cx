import def from './index'

import type { StreamTriggerConfig } from '@lionad/cx-stream'

/**
 * 折叠面板流式增量规则。
 * 主数组为项目 data.items（label/content，v4 必需的数据源），
 * 逐项流式即可渐进铺出面板。
 */
const config: StreamTriggerConfig = {
  key: def._cx_meta.key,
  sections: [{ kind: 'array', arrayKey: 'items' }],
}

export default config
