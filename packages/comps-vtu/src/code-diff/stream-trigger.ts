import def from './index'

import type { StreamTriggerConfig } from '@lionad/cx-stream'

/**
 * 代码差异流式增量规则（标量主体形态）。
 *
 * patch 与 oldCode/newCode 双模式互斥（schema superRefine），三键全可选：
 * 静态 fallback 无法同时适配两形态，给空对象——物料 useCodeDiff 全链路
 * ?? '' 守卫，空 data 渲染空 diff 不崩。skeletonFields 同理不设：可选
 * 字段缺席会让标记在终态常亮，双形态骨架判据（patch 与 oldCode+newCode
 * 双双缺席）留给包装层自绘。
 */
const config: StreamTriggerConfig = {
  key: def._cx_meta.key,
  sections: [
    {
      kind: 'scalar',
      fallbackData: {},
    },
  ],
  frameStride: 10,
}

export default config
