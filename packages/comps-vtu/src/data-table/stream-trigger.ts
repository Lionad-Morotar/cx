import def from './index'

import type { StreamTriggerConfig } from '@lionad/cx-stream'

/**
 * 数据表格流式增量规则。
 * 主数组为行数据 data.data；列定义 data.columns 为次增长路径——
 * 列定义也可能随行数据一起流式传输，不扫描会使截断点落后于它。
 */
const config: StreamTriggerConfig = {
  key: def._cx_meta.key,
  sections: [
    {
      kind: 'array',
      arrayKey: 'data',
      extraScanPaths: [['data', 'columns', '*']],
    },
  ],
}

export default config
