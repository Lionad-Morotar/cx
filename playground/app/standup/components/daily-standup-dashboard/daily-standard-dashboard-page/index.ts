import { normalize, translate } from '@lionad/cx-definition'
import component from './daily-standard-dashboard-page.vue'

export default normalize({
  name: translate('标准站会页面'),
  description: translate('标准站会页面'),
  key: 'cx-daily-standard-dashboard-page',
  component,
  async: true,
})
