import { define, translate } from '@lionad/cx-definition'
import component from './daily-standup-filter.vue'

export default define({
  name: translate('任务筛选'),
  description: translate('用于过滤当前视图的任务'),
  key: 'cx-daily-standup-filter',
  icon: 'i-tabler-filter',
  component,
  async: true,
})
