import def from './index'

import type { StreamTriggerConfig } from '@lionad/cx-stream'

/**
 * 步骤条流式增量规则。
 * 主数组为步骤 data.items（标题/描述/图标），逐条流式即可渐进展示流程。
 */
const config: StreamTriggerConfig = {
  key: def._cx_meta.key,
  sections: [{ kind: 'array', arrayKey: 'items' }],
}

export default config
