import def from './index'

import type { StreamTriggerConfig } from '@lionad/cx-stream'

/**
 * 面包屑流式增量规则。
 * 主数组为层级 data.items（title 层级条目），逐项流式渐进铺出导航路径。
 * key 取自 _cx_meta.key（component.key 经 kebab/camel 往返，数字段会被拆词偏离契约）。
 */
const config: StreamTriggerConfig = {
  key: def._cx_meta.key,
  sections: [{ kind: 'array', arrayKey: 'items' }],
}

export default config
