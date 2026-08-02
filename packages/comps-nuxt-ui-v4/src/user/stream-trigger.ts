import def from './index'

import type { StreamTriggerConfig } from '@lionad/cx-stream'

/**
 * 用户卡流式增量规则（标量主体形态，短属性无骨架）。
 *
 * name/description/avatarSrc 展示内容与 vtu contact-card（kind/value scalar）
 * 同构。fallback 从简自描述：useAttrs 平铺 + Nuxt UI 内部默认值兜底。
 * 不列 skeletonFields（props 全可选）、不做 wrapper 骨架
 * （avatarSrc 空时 UUser 渲头像 fallback，天然空态）。
 */
const config: StreamTriggerConfig = {
  key: def._cx_meta.key,
  sections: [
    {
      kind: 'scalar',
      fallbackData: { name: '', description: '', avatarSrc: '' },
    },
  ],
  frameStride: 10,
}

export default config
