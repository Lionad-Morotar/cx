import def from './index'

import type { ArrayTriggerConfig } from '@lionad/cx-stream'

/**
 * 时间线流式增量规则。
 * 主数组为事件 data.items（日期/标题/图标），逐条流式即可渐进铺出时间轴。
 */
const config: ArrayTriggerConfig = {
  key: def._cx_meta.key,
  arrayKey: 'items',
}

export default config
