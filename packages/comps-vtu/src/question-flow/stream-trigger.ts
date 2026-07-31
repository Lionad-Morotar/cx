import def from './index'

import type { StreamTriggerConfig } from '@lionad/cx-stream'

/**
 * 问答流流式增量规则。
 * 主数组为问题步骤 data.steps，每步自含标题与选项（嵌套数组随步元素
 * 括号平衡一并纳入，无需次级扫描路径）。
 */
const config: StreamTriggerConfig = {
  key: def._cx_meta.key,
  sections: [{ kind: 'array', arrayKey: 'steps' }],
}

export default config
