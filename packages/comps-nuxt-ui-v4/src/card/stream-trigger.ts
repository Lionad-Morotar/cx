import def from './index'

import type { StreamTriggerConfig } from '@lionad/cx-stream'

/**
 * 卡片流式增量规则：每个内容区域 slot 是可独立揭示的 stream section，
 * 区域子树括号完整即揭示、未完整不渲染该区。
 * slots 取自物料定义（当前 header/default/footer 全为内容区域），
 * title/description 等标量 props 随 data 容器闭合显现，不单独声明。
 */
const config: StreamTriggerConfig = {
  key: def._cx_meta.key,
  sections: [{ kind: 'region', slots: Object.keys(def._cx_meta.slots ?? {}) }],
}

export default config
