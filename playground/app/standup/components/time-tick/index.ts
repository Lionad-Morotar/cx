import { normalize, translate } from '@lionad/cx-definition'
import component from './time-tick.vue'

export default normalize({
  name: translate('计时'),
  description: translate(
    '从某个时间开始计时。例如，从现在开始计时，那就是一个简单的计时器效果组件',
  ),
  key: 'cx-time-tick',
  component,
  async: true,
})
