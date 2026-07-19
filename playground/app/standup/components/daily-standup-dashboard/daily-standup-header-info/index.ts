import { normalize, translate } from '@lionad/cx-definition'
import component from './daily-standup-header-info.vue'

export default normalize({
  name: translate('站会信息及快捷操作'),
  description: translate('展示站会时间，以及快速切换成员和历史站会的操作区域'),
  key: 'cx-daily-standup-header-info',
  component,
  async: true,
})
