import def from './index'

import type { StreamTriggerConfig } from '@lionad/cx-stream'

/**
 * 头像流式增量规则（标量主体形态，短属性无骨架）。
 *
 * src/alt 是展示内容（nuiv4 avatar 与 vtu image 短属性 scalar 同构先例）；
 * 原判写于 scalar 形态成熟前，本轮按统一判据改判。
 * fallback 从简自描述：包装层 useAttrs 平铺 + EP 内部默认值兜底，
 * 无嵌套无守卫直访链。不列 skeletonFields（props 全可选，列入即终态常亮）、
 * 不做 wrapper 骨架（空 src 时 ElAvatar 渲 fallback 图标，天然空态）。
 */
const config: StreamTriggerConfig = {
  key: def._cx_meta.key,
  sections: [
    {
      kind: 'scalar',
      fallbackData: { src: '', alt: '' },
    },
  ],
  frameStride: 10,
}

export default config
