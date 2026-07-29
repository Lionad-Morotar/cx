import def from './index'

import type { ArrayTriggerConfig } from '@lionad/cx-stream'

/** 图片画廊流式增量规则：主数组为图片列表 data.images */
const config: ArrayTriggerConfig = {
  key: def._cx_meta.key,
  arrayKey: 'images',
}

export default config
