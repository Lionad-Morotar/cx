import { normalize, translate } from '@lionad/cx-definition'
import component from './fullscreen-button.vue'

export default normalize({
  name: translate('全屏按钮'),
  description: translate('可以使特定组件或当前窗口全屏'),
  key: 'cx-fullscreen-button',
  component,
  async: true,
})
