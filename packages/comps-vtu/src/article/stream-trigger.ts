import def from './index'

import type { StreamTriggerConfig } from '@lionad/cx-stream'

/**
 * 文章流式增量规则（标量主体形态首例）。
 *
 * 文章无增长容器字段：正文 content 是标量字符串，属性「完成」（闭合事件）
 * 即切分点。key 检出即挂载空壳——fallback 保 type/content 必填契约（否则
 * 物料对 undefined 正文渲染字面 "undefined"）；未闭合的 content 注入骨架
 * 标记而非固定帧出半值；frameStride 合并短属性扎堆闭合的出帧频率，
 * 末尾等不到窗口的属性由围栏闭合后的终态 spec 兜底。
 */
const config: StreamTriggerConfig = {
  key: def._cx_meta.key,
  sections: [
    {
      kind: 'scalar',
      fallbackData: { type: 'md', content: '' },
      skeletonFields: ['content'],
    },
  ],
  frameStride: 10,
}

export default config
