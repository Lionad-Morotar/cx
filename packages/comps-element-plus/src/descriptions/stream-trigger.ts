import def from './index'

import type { StreamTriggerConfig } from '@lionad/cx-stream'

/**
 * 描述列表流式增量规则（数组增长形态）。
 *
 * items 条目数组（label/value/span）是答复内容独立载体，成组标签-值
 * 逐条流式即可渐进铺出信息组——无 nuiv4 同构件，按同族（timeline/
 * breadcrumb 条数组铺陈）推导；原判写于 array 判据演进前（仅 table
 * 适用），本轮按统一判据改判。
 */
const config: StreamTriggerConfig = {
  key: def._cx_meta.key,
  sections: [{ kind: 'array', arrayKey: 'items' }],
}

export default config
