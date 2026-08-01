import def from './index'

import type { StreamTriggerConfig } from '@lionad/cx-stream'

/**
 * 引用流式增量规则（标量主体形态，短属性无骨架）。
 *
 * fallback 保 href/title 必填结构；snippet/domain 等短字段闭合即揭示。
 */
const config: StreamTriggerConfig = {
  key: def._cx_meta.key,
  sections: [
    {
      kind: 'scalar',
      fallbackData: { href: '', title: '' },
    },
  ],
  frameStride: 10,
}

export default config
