import def from './index'

import type { StreamTriggerConfig } from '@lionad/cx-stream'

/**
 * 页头流式增量规则：六个内容区域（title/left/default/right/body/content）
 * 各自独立揭示，区域子树括号完整即渲染该区。
 * slots 取自物料定义，声明序 = 揭示序 = 序列化序。
 */
const config: StreamTriggerConfig = {
  key: def._cx_meta.key,
  sections: [{ kind: 'region', slots: Object.keys(def._cx_meta.slots ?? {}) }],
}

export default config
