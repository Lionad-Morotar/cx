import { normalize, translate } from '@lionad/cx-definition'
import component from './ui/index.vue'
import PanelTabs from './panel/tabs.vue'

export default normalize({
  name: translate('标签页'),
  description: translate('卡片标签页组件'),
  key: 'cx-card-tabs',
  component,
  async: true,
  props: {
    tabs: {
      type: 'json',
      name: translate('标签页'),
      component: PanelTabs,
    },
    isAutoSelect: {
      type: 'switch',
      name: translate('自动选中'),
      default: true,
    },
  },
  slots: {
    default: {
      key: 'default',
      name: translate('默认插槽'),
      description: translate(
        '所有标签页都通用的内容可以放到默认插槽，在一些特殊场景，比如标签页中只有一个表格，而切换标签页只是改变表格内容，就符合这种情况，页面不需要创建两个表格，所以直接把放到默认插槽中，数据由表格或页面自行维护',
      ),
    },
    'tab-item-icon': { key: 'tab-item-icon', name: translate('标签项图标') },
    'tab-item-title': { key: 'tab-item-title', name: translate('标签项文本') },
  },
})
