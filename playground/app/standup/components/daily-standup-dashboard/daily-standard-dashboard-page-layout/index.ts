import { define, translate } from '@lionad/cx-definition'
import component from './daily-standard-dashboard-page-layout.vue'

export default define({
  name: translate('站会详情页面布局'),
  description: translate('标准站会详情页面布局'),
  key: 'cx-daily-standard-dashboard-page-layout',
  icon: 'i-tabler-layout-dashboard',
  component,
  slots: {
    'page-header': {
      key: 'page-header',
      name: '页面头部中间区域',
      description: '默认放站会时间和切换站会用户按钮',
    },
    'page-header-right': {
      key: 'page-header-right',
      name: '页面头部右侧区域',
      description: '默认放返回和结束会议等按钮',
    },
    'page-content-left': {
      key: 'page-content-left',
      name: '页面主体区域左侧',
      description: '默认放“我参与的”、“我创建的”等筛选器',
    },
    'page-content-main': {
      key: 'page-content-main',
      name: '页面主体区域',
      description: '默认放任务列表和代办事项',
    },
    'page-content-right': {
      key: 'page-content-right',
      name: '页面主体区域右侧',
      description: '默认放参会成员头像',
    },
  },
})
