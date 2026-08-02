import def from './index'

import type { StreamTriggerConfig } from '@lionad/cx-stream'

/**
 * 卡片流式增量规则（多区容器形态）。
 *
 * default/header 两个内容区域槽是可独立揭示的 stream section，区域子树
 * 括号完整即揭示、未完整不渲染该区——nuiv4 card 同构先例；原判写于
 * region 形态成熟前（仅 table 适用），本轮按统一判据改判。
 * slots 取自物料定义键集，增删槽位时配置自动跟随；与 space 的分界是
 * 多内容区语义 vs 单槽布局壳。shadow 等标量 props 随 data 容器闭合
 * 显现，不单独声明。
 */
const config: StreamTriggerConfig = {
  key: def._cx_meta.key,
  sections: [{ kind: 'region', slots: Object.keys(def._cx_meta.slots ?? {}) }],
}

export default config
