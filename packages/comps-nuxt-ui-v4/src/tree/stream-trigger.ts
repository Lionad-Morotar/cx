import def from './index'

import type { StreamTriggerConfig } from '@lionad/cx-stream'

/**
 * 树流式增量规则。
 * 主数组为顶层节点 data.items；子节点嵌套在节点元素内部，随其括号平衡
 * 一并纳入，无需次级扫描路径。
 */
const config: StreamTriggerConfig = {
  key: def._cx_meta.key,
  sections: [{ kind: 'array', arrayKey: 'items' }],
}

export default config
