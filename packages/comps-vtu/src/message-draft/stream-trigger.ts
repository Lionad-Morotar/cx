import def from './index'

import type { StreamTriggerConfig } from '@lionad/cx-stream'

/**
 * 消息草稿流式增量规则（标量主体形态）。
 *
 * channel 判别联合（email/slack）的静态兜底须双分支兼容：email 四键
 * （channel/subject/to/body）之外必须带 slack 的 target 结构——slack 分支
 * 模板无守卫直访 target.type/name，channel 真值转 slack 后若 target 缺席
 * 即 TypeError；email 分支不读 target，残留键无害。skeleton 标记 body
 * （两分支均必填的长文本），正文未闭合期间包装层骨架占位。
 */
const config: StreamTriggerConfig = {
  key: def._cx_meta.key,
  sections: [
    {
      kind: 'scalar',
      fallbackData: {
        channel: 'email',
        subject: '',
        to: [],
        body: '',
        target: { type: 'channel', name: '' },
      },
      skeletonFields: ['body'],
    },
  ],
  frameStride: 10,
}

export default config
