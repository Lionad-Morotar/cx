import { normalize, translate } from '@lionad/cx-definition'
import component from './time-count.vue'

export default normalize({
  name: translate('时间展示'),
  description: translate('可以展示静态或动态的时间，当然，你可以自由地选择时间的格式化信息'),
  key: 'cx-time-count',
  component,
  async: true,
})
