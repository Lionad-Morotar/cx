import def from './index'

import type { StreamTriggerConfig } from '@lionad/cx-stream'

/**
 * 页顶公告条流式增量规则（标量主体形态，短属性无骨架）。
 *
 * title 是答复内容独立载体（alert 同族）；default/actions 槽为可选覆盖语义。
 * fallback 从简自描述：useAttrs 平铺 + Nuxt UI 内部默认值兜底。
 * 不列 skeletonFields（props 全可选）、不做 wrapper 骨架
 * （空 title 时 UBanner 仍渲组件外壳，天然空态）。
 */
const config: StreamTriggerConfig = {
  key: def._cx_meta.key,
  sections: [
    {
      kind: 'scalar',
      fallbackData: { title: '' },
    },
  ],
  frameStride: 10,
}

export default config
