import def from './index'

import type { StreamTriggerConfig } from '@lionad/cx-stream'

/**
 * 描述列表流式增量规则。
 * 主数组为条目 data.items（label/value/span 展示条目），逐项流式渐进铺出明细。
 * key 取自 _cx_meta.key（component.key 经 kebab/camel 往返，数字段会被拆词偏离契约）。
 */
const config: StreamTriggerConfig = {
  key: def._cx_meta.key,
  sections: [{ kind: 'array', arrayKey: 'items' }],
}

export default config
