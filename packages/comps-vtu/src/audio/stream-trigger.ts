import def from './index'

import type { StreamTriggerConfig } from '@lionad/cx-stream'

/**
 * 音频流式增量规则（标量主体形态，短属性无骨架）。
 *
 * fallback 保 assetId/src 必填结构；空 src 经实证安全——物料对空源渲染
 * hidden。字段皆短值，属性闭合即揭示（标题、描述、封面逐个生长）。
 */
const config: StreamTriggerConfig = {
  key: def._cx_meta.key,
  sections: [
    {
      kind: 'scalar',
      fallbackData: { assetId: '', src: '' },
    },
  ],
  frameStride: 10,
}

export default config
