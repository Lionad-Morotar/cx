import def from './index'

import type { StreamTriggerConfig } from '@lionad/cx-stream'

/**
 * 联系卡流式增量规则（标量主体形态，短属性无骨架）。
 *
 * fallback 保 kind/value 必填结构（kind 取合法值 email，与 wrapper
 * initial 对齐）；label 等短字段闭合即揭示。
 */
const config: StreamTriggerConfig = {
  key: def._cx_meta.key,
  sections: [
    {
      kind: 'scalar',
      fallbackData: { kind: 'email', value: '' },
    },
  ],
  frameStride: 10,
}

export default config
