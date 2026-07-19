import { normalize, translate } from '@lionad/cx-definition'
import component from './weekly-standard-dashboard-page.vue'

export default normalize({
  name: translate('标准EAP周会页面'),
  description: translate('标准EAP周会页面'),
  key: 'cx-weekly-standup-dashboard-page',
  component,
  async: true,
})
