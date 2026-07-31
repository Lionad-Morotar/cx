import def from './index'

import type { StreamTriggerConfig } from '@lionad/cx-stream'

/**
 * 侧边栏流式增量规则：header/default/footer 三个内容区域各自独立揭示。
 * slots 取自物料定义，声明序 = 揭示序 = 序列化序。
 */
const config: StreamTriggerConfig = {
  key: def._cx_meta.key,
  sections: [{ kind: 'region', slots: Object.keys(def._cx_meta.slots ?? {}) }],
}

export default config
