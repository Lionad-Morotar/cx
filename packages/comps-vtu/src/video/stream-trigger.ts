import def from './index'

import type { StreamTriggerConfig } from '@lionad/cx-stream'

/**
 * 视频流式增量规则（标量主体形态，短属性无骨架）。
 *
 * fallback 保 assetId/src 必填结构；空 src 渲染为空播放器框（实证不破）。
 * poster/title 等短元数据闭合即揭示。
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
