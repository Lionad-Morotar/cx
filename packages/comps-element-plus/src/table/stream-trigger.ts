import def from './index'

import type { StreamTriggerConfig } from '@lionad/cx-stream'

/**
 * 表格流式增量规则（数组增长型）。
 * key 取自 _cx_meta.key（component.key 经 kebab/camel 往返，数字段会被 lodash 拆词偏离契约）。
 * 主数组为行数据 data.data；列定义 data.columns 为次增长路径——
 * 列定义也可能随行数据一起流式传输，不扫描会使截断点落后于它（与 vtu data-table 同形）。
 * 当前物料 props 序为 columns 在前、data 在后：列定义先于行生长完整闭合，
 * 该路径行为上惰性，但 props 序一旦调整即重新承载尾随列的渐次揭示，声明保留。
 * 不开 emptyPassthrough：行为与旧 DSL 声明逐位等价，空态透传留作独立裁决。
 */
const config: StreamTriggerConfig = {
  key: def._cx_meta.key,
  sections: [
    { kind: 'array', arrayKey: 'data', extraScanPaths: [['data', 'columns', '*']] },
  ],
}

export default config
