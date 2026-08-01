import def from './index'

import type { StreamTriggerConfig } from '@lionad/cx-stream'

/**
 * 代码块流式增量规则（标量主体形态）。
 *
 * code 是长文本主体且 zod 必填：fallback 空串保首帧空壳契约，language/
 * filename 等短元数据闭合即揭示；skeleton 标记 code（必填字段，完整帧
 * 必消失），正文代码未闭合期间由包装层骨架占位而非出半值。
 */
const config: StreamTriggerConfig = {
  key: def._cx_meta.key,
  sections: [
    {
      kind: 'scalar',
      fallbackData: { code: '' },
      skeletonFields: ['code'],
    },
  ],
  frameStride: 10,
}

export default config
