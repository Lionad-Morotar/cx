import def from './index'

import type { ArrayTriggerConfig } from '@lionad/cx-stream'

/**
 * 进度追踪流式增量规则。
 * 主数组为步骤 data.steps（含状态与耗时），逐条流式即可渐进展示流程进度。
 */
const config: ArrayTriggerConfig = {
  key: def._cx_meta.key,
  arrayKey: 'steps',
}

export default config
