import def from './index'

import type { StreamTriggerConfig } from '@lionad/cx-stream'

/**
 * 警告提示流式增量规则（标量主体形态）。
 * title/content 为答复内容独立载体；key 检出即空壳挂载（fallback 保契约），属性闭合即揭示。
 * fallback 从简自描述：包装层 useAttrs 平铺 + NAlert 内部默认值兜底，content 直访带
 * `?? ''` 守卫（wrapper computed 实证），嵌套无守卫直访链不存在。
 * 不设 skeletonFields：props 全带 initial 值（可选），列入会让 _cx_streaming 标记终态常亮。
 * 不做 wrapper 骨架：NAlert 空 title/content 仍渲组件外壳，天然空态足够。
 */
const config: StreamTriggerConfig = {
  key: def._cx_meta.key,
  sections: [{ kind: 'scalar', fallbackData: { title: '', content: '' } }],
  frameStride: 10,
}

export default config
