import def from './index'

import type { StreamTriggerConfig } from '@lionad/cx-stream'

/**
 * 结果页流式增量规则（标量主体形态）。
 * title/description 为答复内容独立载体（status 为枚举配置，不进 fallback，
 * NResult 内部默认 info 兜底）；key 检出即空壳挂载，属性闭合即揭示。
 * fallback 从简自描述：包装层 useAttrs 平铺 + NResult 内部默认值兜底，无模板直访链。
 * 不设 skeletonFields：props 全带 initial 值（可选），列入会让 _cx_streaming 标记终态常亮。
 * 不做 wrapper 骨架：NResult 空 title/description 仍渲状态图标与外壳，天然空态足够。
 */
const config: StreamTriggerConfig = {
  key: def._cx_meta.key,
  sections: [{ kind: 'scalar', fallbackData: { title: '', description: '' } }],
  frameStride: 10,
}

export default config
