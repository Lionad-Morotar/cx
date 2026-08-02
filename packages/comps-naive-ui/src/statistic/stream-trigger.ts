import def from './index'

import type { StreamTriggerConfig } from '@lionad/cx-stream'

/**
 * 统计数值流式增量规则（标量主体形态）。
 * label/value 为答复内容独立载体（统计卡为 dashboard 场景核心物料；tabularNums 为配置，
 * 不进 fallback）；短属性 scalar 与 avatar（src）同判据——区别于 badge 的依附宿主标记，
 * statistic 是独立展示物料。key 检出即空壳挂载，属性闭合即揭示。
 * fallback 从简自描述：包装层 useAttrs 平铺 + NStatistic 内部默认值兜底，无模板直访链。
 * 不设 skeletonFields：props 全带 initial 值（可选），列入会让 _cx_streaming 标记终态常亮。
 * 不做 wrapper 骨架：NStatistic 空 label/value 仍渲布局外壳，天然空态足够。
 */
const config: StreamTriggerConfig = {
  key: def._cx_meta.key,
  sections: [{ kind: 'scalar', fallbackData: { label: '', value: '' } }],
  frameStride: 10,
}

export default config
