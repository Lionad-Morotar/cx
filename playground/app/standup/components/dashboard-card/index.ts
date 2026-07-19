import { normalize, translate } from '@lionad/cx-definition'
import component from './ui/index.vue'

export default normalize({
  name: translate('看板卡片'),
  description: translate('看板卡片是一个特殊样式组件，提供了丰富的插槽和配置用于定制卡片样式'),
  key: 'cx-dashboard-card',
  component,
  async: true,
  props: {
    title: {
      name: translate('卡片标题'),
      type: 'string',
      default: '看板',
    },
    sideTitle: {
      name: translate('卡片副标题'),
      type: 'string',
    },
    themeColor: {
      name: translate('主题色'),
      description: translate('目前只会影响加载图标和引号图标的颜色'),
      type: 'string',
    },
    fullContent: {
      name: translate('内容自适应占满区域'),
      description: '正常情况下，内容区域使用 flex 栏布局',
      type: 'switch',
      default: false,
    },
    isLoading: {
      name: translate('加载状态'),
      type: 'switch',
    },
  },
  slots: {
    header: { key: 'header', name: translate('卡片头部') },
    loading: { key: 'loading', name: translate('卡片加载样式') },
    default: { key: 'default', name: translate('卡片内容区域') },
  },
})
