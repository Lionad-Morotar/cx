import def from './index'

import type { StreamTriggerConfig } from '@lionad/cx-stream'

/**
 * 空态流式增量规则（标量主体形态，短属性无骨架）。
 *
 * description 是答复内容独立载体，schema 页面表达「此区无数据」语义
 * （nuiv4 empty 同构先例）；原判写于 scalar 形态成熟前，本轮按统一判据改判。
 * fallback 从简自描述：包装层 useAttrs 平铺 + EP 内部默认值兜底，
 * 无嵌套无守卫直访链。不列 skeletonFields（props 全可选，列入即终态常亮）、
 * 不做 wrapper 骨架（空 description 时 ElEmpty 仍渲默认插图与外壳，天然空态）。
 */
const config: StreamTriggerConfig = {
  key: def._cx_meta.key,
  sections: [
    {
      kind: 'scalar',
      fallbackData: { description: '' },
    },
  ],
  frameStride: 10,
}

export default config
