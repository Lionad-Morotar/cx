import { define, translate } from '@lionad/cx-definition'
import component from './ui/index.vue'

/**
 * 站会分组循环容器：按 card-tabs 模式工作——
 * group-item 模板插槽种类固定，渲染数量由 groups 数据长度驱动，
 * 每个分组经 StandupContextProvider 注入当前 group 供模板子节点消费。
 */
export default define({
  name: translate('站会分组列表'),
  description: translate('按分组循环渲染 group-item 模板插槽，单项 group 数据经上下文注入'),
  key: 'cx-standup-group-list',
  icon: 'i-tabler-stack-2',
  component,
  async: true,
  slots: {
    'group-item': { key: 'group-item', name: translate('分组模板') },
  },
})
