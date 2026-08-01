import def from './index'

import type { StreamTriggerConfig } from '@lionad/cx-stream'

/**
 * 终端流式增量规则（标量主体形态）。
 *
 * fallback 保 command/exitCode 必填契约；stdout/stderr 是长文本但 zod
 * 可选——skeletonFields 只列必填字段（可选字段缺席会让标记终态常亮），
 * 故不设。终端语义天然契合属性揭示：command 闭合即见命令，stdout 流式
 * 期间物料呈现「命令已出、输出待传」，输出字段闭合后贴上。
 */
const config: StreamTriggerConfig = {
  key: def._cx_meta.key,
  sections: [
    {
      kind: 'scalar',
      fallbackData: { command: '', exitCode: 0 },
    },
  ],
  frameStride: 10,
}

export default config
