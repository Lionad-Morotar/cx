import def from './index'

import type { StreamTriggerConfig } from '@lionad/cx-stream'

/**
 * 步骤条流式增量规则（数组增长形态）。
 *
 * steps 步骤数组（title/description/status）是答复内容独立载体，
 * 逐步流式即可渐进铺出流程——nuiv4 stepper 同构先例；原判写于
 * array 判据演进前（仅 table 适用），本轮按统一判据改判。
 * 尾随标量 active 不进增量帧，随完整 JSON 终态帧兜底。
 */
const config: StreamTriggerConfig = {
  key: def._cx_meta.key,
  sections: [{ kind: 'array', arrayKey: 'steps' }],
}

export default config
