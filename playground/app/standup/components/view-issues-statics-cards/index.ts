import { normalize, translate } from '@lionad/cx-definition'
import component from './index.vue'

export default normalize({
  name: translate('任务数据统计'),
  description: translate('根据任务数据，统计不同状态的任务数量、完成率、等待时间等指标的组件'),
  key: 'cx-view-issues-statics-cards',
  component,
  async: true,
})
