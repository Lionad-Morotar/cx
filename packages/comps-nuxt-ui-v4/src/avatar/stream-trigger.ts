import def from './index'

import type { StreamTriggerConfig } from '@lionad/cx-stream'

/**
 * 头像流式增量规则（标量主体形态，短属性无骨架）。
 *
 * src/alt/text 展示内容与 vtu image（src/alt 短属性 scalar）同构。
 * fallback 从简自描述：useAttrs 平铺 + UAvatar src 空时渲 fallback 图标
 * （天然空态），无嵌套无守卫直访链。不列 skeletonFields（props 全可选）、
 * 不做 wrapper 骨架。
 */
const config: StreamTriggerConfig = {
  key: def._cx_meta.key,
  sections: [
    {
      kind: 'scalar',
      fallbackData: { src: '', alt: '', text: '' },
    },
  ],
  frameStride: 10,
}

export default config
