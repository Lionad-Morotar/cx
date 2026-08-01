import def from './index'

import type { StreamTriggerConfig } from '@lionad/cx-stream'

/**
 * X 贴文流式增量规则（标量主体形态）。
 *
 * 贴文是单体嵌套对象：post 为唯一顶层字段。fallback 保 post.author 三键
 * 结构——物料模板无守卫直访 post.author.name/avatarUrl，首帧空壳若缺
 * author 对象即 TypeError；skeleton 标记 post（zod 必填），包装层据此
 * 在贴文未闭合期间以骨架占位。
 */
const config: StreamTriggerConfig = {
  key: def._cx_meta.key,
  sections: [
    {
      kind: 'scalar',
      fallbackData: { post: { author: { name: '', handle: '', avatarUrl: '' } } },
      skeletonFields: ['post'],
    },
  ],
  frameStride: 10,
}

export default config
