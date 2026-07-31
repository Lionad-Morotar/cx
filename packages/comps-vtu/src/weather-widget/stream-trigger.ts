import def from './index'

import type { StreamTriggerConfig } from '@lionad/cx-stream'

/**
 * 天气组件流式增量规则。
 * 主数组为多日预报 data.forecast；位置/单位/实况是标量对象且排在前，
 * 首条预报完整时它们已就位，无需次级扫描路径或尾随推导。
 */
const config: StreamTriggerConfig = {
  key: def._cx_meta.key,
  sections: [{ kind: 'array', arrayKey: 'forecast' }],
}

export default config
