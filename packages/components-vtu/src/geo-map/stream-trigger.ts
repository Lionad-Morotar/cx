import def from './index'

import type { ArrayTriggerConfig } from '@lionad/cx-stream'

/** 地理地图流式增量规则：主数组为标记点 data.markers，路线 data.routes 为次增长路径 */
const config: ArrayTriggerConfig = {
  key: def.key,
  arrayKey: 'markers',
  extraScanPaths: [['data', 'routes', '*']],
}

export default config
