import def from './index'

import type { StreamTriggerConfig } from '@lionad/cx-stream'

/** 选项列表流式增量规则：主数组为选项 data.options，操作按钮 data.actions 为次增长路径 */
const config: StreamTriggerConfig = {
  key: def._cx_meta.key,
  sections: [
    {
      kind: 'array',
      arrayKey: 'options',
      extraScanPaths: [['data', 'actions', '*']],
    },
  ],
}

export default config
