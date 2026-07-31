import def from './index'

import type { StreamTriggerConfig } from '@lionad/cx-stream'

/** 地理地图流式增量规则：主数组为标记点 data.markers，路线 data.routes 为次增长路径 */
const config: StreamTriggerConfig = {
  key: def._cx_meta.key,
  sections: [
    {
      kind: 'array',
      arrayKey: 'markers',
      extraScanPaths: [['data', 'routes', '*']],
    },
  ],
}

export default config
