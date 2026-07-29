import def from './index'

import type { ArrayTriggerConfig } from '@lionad/cx-stream'

/**
 * 表格流式增量规则。
 * key 取自 _cx_meta.key（component.key 经 kebab/camel 往返，数字段会被 lodash 拆词偏离契约）。
 * 主数组为行数据 data.data；列定义 data.columns 为次增长路径——
 * 列定义也可能随行数据一起流式传输，不扫描会使截断点落后于它（与 vtu data-table 同形）。
 */
const config: ArrayTriggerConfig = {
  key: def._cx_meta.key,
  arrayKey: 'data',
  extraScanPaths: [['data', 'columns', '*']],
}

export default config
