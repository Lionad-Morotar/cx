import def from './index'

import type { StreamTriggerConfig } from '@lionad/cx-stream'

/**
 * 条目轮播流式增量规则。
 * 主数组为条目 data.items（标题/副标题/图片），逐条流式即可逐卡渲染。
 */
const config: StreamTriggerConfig = {
  key: def._cx_meta.key,
  sections: [{ kind: 'array', arrayKey: 'items' }],
}

export default config
