import { normalize, translate } from '@lionad/cx-definition'
import component from './weekly-standard-dashboard-page-layout.vue'

export default normalize({
  name: translate('周会详情页面'),
  description: translate('标准周会详情页面布局'),
  key: 'cx-weekly-standup-dashboard-page-layout',
  component,
  slots: {
    'page-header-center': {
      key: 'page-header-center',
      name: translate('页面头部中间区域'),
      description: translate('默认放周会时间'),
    },
    'page-header-right': {
      key: 'page-header-right',
      name: translate('页面头部右侧区域'),
      description: translate('默认放返回和结束会议等按钮'),
    },
    'page-main-section': {
      key: 'page-main-section',
      name: translate('页面主体区域'),
      description: translate('默认放本周和下周的任务统计和任务表格'),
    },
    'page-aside-section': {
      key: 'page-aside-section',
      name: translate('页面侧边区域'),
      description: translate('默认放代办事项'),
    },
    'page-right-section': {
      key: 'page-right-section',
      name: translate('页面右侧区域'),
      description: translate('默认放参会成员头像'),
    },
  },
})
