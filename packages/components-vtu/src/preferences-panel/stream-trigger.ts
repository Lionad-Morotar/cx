import def from './index'

import type { ArrayTriggerConfig } from '@lionad/cx-stream'

/**
 * 偏好面板流式增量规则。
 * 主数组为分区 data.sections，分区的控件条目是嵌套数组，随分区元素
 * 括号平衡一并纳入，无需次级扫描路径。
 */
const config: ArrayTriggerConfig = {
  key: def._cx_meta.key,
  arrayKey: 'sections',
}

export default config
