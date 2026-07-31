import def from './index'

import type { StreamTriggerConfig } from '@lionad/cx-stream'

/**
 * 页脚列流式增量规则：columns 列定义数组主切分（逐列渐进），
 * left/right 内容区域独立揭示——两形态各动各的字段域，
 * 列未传输时区域可先现，区域未闭合时列可先铺。
 */
const config: StreamTriggerConfig = {
  key: def._cx_meta.key,
  sections: [
    { kind: 'array', arrayKey: 'columns' },
    { kind: 'region', slots: Object.keys(def._cx_meta.slots ?? {}) },
  ],
}

export default config
