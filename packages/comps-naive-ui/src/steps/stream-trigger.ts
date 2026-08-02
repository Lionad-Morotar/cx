import def from './index'

import type { StreamTriggerConfig } from '@lionad/cx-stream'

/**
 * 步骤条流式增量规则。
 * 主数组为步骤 data.steps（title/description 步骤条目），逐项流式渐进铺出步骤。
 * key 取自 _cx_meta.key（component.key 经 kebab/camel 往返，数字段会被拆词偏离契约）。
 */
const config: StreamTriggerConfig = {
  key: def._cx_meta.key,
  sections: [{ kind: 'array', arrayKey: 'steps' }],
}

export default config
