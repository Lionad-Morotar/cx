import def from './index'

import type { StreamTriggerConfig } from '@lionad/cx-stream'

/**
 * 错误页流式增量规则（标量主体形态，短属性无骨架）。
 *
 * statusMessage/message 是答复内容独立载体；statusCode 数值字段经闭合事件
 * 切分无半值截断风险（scalar 截断永远落在闭合事件处）。
 * fallback 从简自描述：useAttrs 平铺 + Nuxt UI 内部默认值兜底。
 * 不列 skeletonFields（props 全可选）、不做 wrapper 骨架
 * （UError 空内容仍渲错误页外壳，天然空态）。
 */
const config: StreamTriggerConfig = {
  key: def._cx_meta.key,
  sections: [
    {
      kind: 'scalar',
      fallbackData: { statusMessage: '', message: '' },
    },
  ],
  frameStride: 10,
}

export default config
