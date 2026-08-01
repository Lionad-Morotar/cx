import def from './index'

import type { StreamTriggerConfig } from '@lionad/cx-stream'

/**
 * 审批卡流式增量规则（标量主体形态，短属性无骨架）。
 *
 * fallback 保 title 必填结构；description/variant/actions 等短字段闭合
 * 即揭示。
 */
const config: StreamTriggerConfig = {
  key: def._cx_meta.key,
  sections: [
    {
      kind: 'scalar',
      fallbackData: { title: '' },
    },
  ],
  frameStride: 10,
}

export default config
