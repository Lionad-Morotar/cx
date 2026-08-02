import def from './index'

import type { StreamTriggerConfig } from '@lionad/cx-stream'

/**
 * 空态展示流式增量规则（标量主体形态，短属性无骨架）。
 *
 * title/description 是答复内容独立载体（schema 页面表达「此区无数据」语义）。
 * fallback 从简自描述：useAttrs 平铺 + Nuxt UI 内部默认值兜底。
 * 不列 skeletonFields（props 全可选）、不做 wrapper 骨架
 * （UEmpty 本体即空态组件，空内容仍渲组件外壳，天然空态的极端形态）。
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
