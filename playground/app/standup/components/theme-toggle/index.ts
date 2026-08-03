import { define, translate } from '@lionad/cx-definition'
import component from './theme-toggle.vue'

export default define({
  name: translate('主题开关'),
  description: translate('浅色 / 深色 / 跟随系统三态循环切换，接入 color-mode'),
  key: 'cx-theme-toggle',
  component,
  async: true,
})
