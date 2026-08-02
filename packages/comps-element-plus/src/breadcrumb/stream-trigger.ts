import def from './index'

import type { StreamTriggerConfig } from '@lionad/cx-stream'

/**
 * 面包屑流式增量规则（数组增长形态）。
 *
 * items 层级数组（label）是答复内容独立载体，逐级流式即可渐进铺出
 * 路径——nuiv4 breadcrumb 同构先例；原判写于 array 判据演进前
 * （仅 table 适用），本轮按统一判据改判。
 * 尾随标量 separator 不进增量帧，随完整 JSON 终态帧兜底。
 */
const config: StreamTriggerConfig = {
  key: def._cx_meta.key,
  sections: [{ kind: 'array', arrayKey: 'items' }],
}

export default config
