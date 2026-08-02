import def from './index'

import type { StreamTriggerConfig } from '@lionad/cx-stream'

/**
 * 警告提示流式增量规则（标量主体形态，短属性无骨架）。
 *
 * title/description 是答复内容独立载体（approval-card title-only scalar 先例）；
 * 内容槽（leading/title/description/actions）为可选覆盖语义，主载体是 data props。
 * fallback 从简自描述：包装层 useAttrs 平铺 + Nuxt UI 内部默认值兜底，
 * 无嵌套无守卫直访链。不列 skeletonFields（props 全可选，列入即终态常亮）、
 * 不做 wrapper 骨架（空 title/description 时 UAlert 仍渲组件外壳，天然空态）。
 */
const config: StreamTriggerConfig = {
  key: def._cx_meta.key,
  sections: [
    {
      kind: 'scalar',
      fallbackData: { title: '', description: '' },
    },
  ],
  frameStride: 10,
}

export default config
