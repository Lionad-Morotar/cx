import def from './index'

import type { StreamTriggerConfig } from '@lionad/cx-stream'

/**
 * Instagram 贴文流式增量规则（标量主体形态）。
 *
 * 与 x-post 同构：post 单体嵌套对象，物料模板无守卫直访 post.author.*，
 * fallback 保 author 三键结构防空壳帧 TypeError；skeleton 标记 post
 * （zod 必填），正文 text 未闭合期间由包装层骨架占位。
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
