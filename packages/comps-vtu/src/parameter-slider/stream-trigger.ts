import def from './index'

import type { StreamTriggerConfig } from '@lionad/cx-stream'

/**
 * 参数滑块流式增量规则。
 * 主数组为滑块 data.sliders（区间/步长/当前值），逐条流式即可渐进
 * 铺出参数面板。
 */
const config: StreamTriggerConfig = {
  key: def._cx_meta.key,
  sections: [{ kind: 'array', arrayKey: 'sliders' }],
}

export default config
