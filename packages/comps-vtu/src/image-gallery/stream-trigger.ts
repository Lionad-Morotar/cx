import def from './index'

import type { StreamTriggerConfig } from '@lionad/cx-stream'

/** 图片画廊流式增量规则：主数组为图片列表 data.images */
const config: StreamTriggerConfig = {
  key: def._cx_meta.key,
  sections: [{ kind: 'array', arrayKey: 'images' }],
}

export default config
