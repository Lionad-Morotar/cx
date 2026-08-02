import def from './index'

import type { StreamTriggerConfig } from '@lionad/cx-stream'

/**
 * 头像流式增量规则（标量主体形态）。
 * src 为答复内容独立载体（round/size 为配置，不进 fallback）；短属性 scalar 与
 * vtu image（src/alt）、nuiv4 avatar 先例同构。key 检出即空壳挂载，属性闭合即揭示。
 * fallback 从简自描述：包装层 useAttrs 平铺 + NAvatar 内部默认值兜底，无模板直访链。
 * 不设 skeletonFields：props 全带 initial 值（可选），列入会让 _cx_streaming 标记终态常亮。
 * 不做 wrapper 骨架：NAvatar src 空仍渲默认头像占位，天然空态足够。
 */
const config: StreamTriggerConfig = {
  key: def._cx_meta.key,
  sections: [{ kind: 'scalar', fallbackData: { src: '' } }],
  frameStride: 10,
}

export default config
