import { normalize, translate } from '@lionad/cx-definition'
import component from './ui/index.vue'

/**
 * 站会卡片循环容器：按 card-tabs 模式工作——
 * card-item 模板插槽种类固定，渲染数量由当前 group 的 standups 长度驱动，
 * 每张卡片经 StandupContextProvider 注入 { standup, group, idx } 供模板子节点消费。
 */
export default normalize({
  name: translate('站会卡片列表'),
  description: translate('按 group.standups 循环渲染 card-item 模板插槽，单项卡片数据经上下文注入'),
  key: 'cx-standup-card-list',
  component,
  async: true,
  slots: {
    'card-item': { key: 'card-item', name: translate('卡片模板') },
  },
})
