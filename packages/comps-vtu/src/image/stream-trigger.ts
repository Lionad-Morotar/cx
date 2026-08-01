import def from './index'

import type { StreamTriggerConfig } from '@lionad/cx-stream'

/**
 * 图片流式增量规则（标量主体形态，短属性无骨架）。
 *
 * fallback 保 assetId/src/alt 必填结构（alt 为 a11y 契约 min(1)）；空 src
 * 经物料 sanitizeHref 吞为 undefined，不破图。title/description/href 等
 * 短元数据闭合即揭示。
 */
const config: StreamTriggerConfig = {
  key: def._cx_meta.key,
  sections: [
    {
      kind: 'scalar',
      fallbackData: { assetId: '', src: '', alt: '' },
    },
  ],
  frameStride: 10,
}

export default config
