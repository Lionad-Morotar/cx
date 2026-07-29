import def from './index'

import type { ArrayTriggerConfig } from '@lionad/cx-stream'

/**
 * 计划流式增量规则。
 * 主数组为待办 data.todos（含状态），逐条流式即可渐进铺出清单。
 */
const config: ArrayTriggerConfig = {
  key: def._cx_meta.key,
  arrayKey: 'todos',
}

export default config
