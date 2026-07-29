import def from './index'

import type { ArrayTriggerConfig } from '@lionad/cx-stream'

/**
 * 条目轮播流式增量规则。
 * 主数组为条目 data.items（标题/副标题/图片），逐条流式即可逐卡渲染。
 */
const config: ArrayTriggerConfig = {
  key: def._cx_meta.key,
  arrayKey: 'items',
}

export default config
