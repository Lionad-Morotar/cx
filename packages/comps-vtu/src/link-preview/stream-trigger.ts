import def from './index'

import type { StreamTriggerConfig } from '@lionad/cx-stream'

/**
 * 链接预览流式增量规则（标量主体形态，短属性无骨架）。
 *
 * fallback 保 href 必填结构；title/description/image/domain 等短元数据
 * 闭合即揭示。
 */
const config: StreamTriggerConfig = {
  key: def._cx_meta.key,
  sections: [
    {
      kind: 'scalar',
      fallbackData: { href: '' },
    },
  ],
  frameStride: 10,
}

export default config
