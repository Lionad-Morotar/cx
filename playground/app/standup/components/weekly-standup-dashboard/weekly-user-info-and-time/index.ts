import { normalize, translate } from '@lionad/cx-definition'
import component from './weekly-user-info-and-time.vue'

export default normalize({
  name: translate('用户名称及会议时间'),
  description: translate('显示当前用户头像及名称，以及此次会议的时间'),
  key: 'cx-weekly-user-info-and-time',
  component,
  async: true,
})
