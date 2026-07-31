import def from './index'

import type { StreamTriggerConfig } from '@lionad/cx-stream'

/**
 * 订单摘要流式增量规则。
 * 主数组为商品 data.items（数量/单价）。pricing 是标量汇总对象且排在
 * 末尾，流式期间缺席只影响总计展示，商品清单照常渲染，围栏闭合后补齐。
 */
const config: StreamTriggerConfig = {
  key: def._cx_meta.key,
  sections: [{ kind: 'array', arrayKey: 'items' }],
}

export default config
