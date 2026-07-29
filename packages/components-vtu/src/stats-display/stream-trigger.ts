import def from './index'

import type { ArrayTriggerConfig } from '@lionad/cx-stream'

/** 统计展示流式增量规则：主数组为指标列表 data.stats */
const config: ArrayTriggerConfig = {
  key: def.key,
  arrayKey: 'stats',
}

export default config
