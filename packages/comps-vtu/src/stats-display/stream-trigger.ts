import def from './index'

import type { StreamTriggerConfig } from '@lionad/cx-stream'

/** 统计展示流式增量规则：主数组为指标列表 data.stats */
const config: StreamTriggerConfig = {
  key: def._cx_meta.key,
  sections: [{ kind: 'array', arrayKey: 'stats' }],
}

export default config
