import { define, translate } from '@lionad/cx-definition'
import component from './daily-page-actions.vue'

export default define({
  name: translate('标准站会页页头按钮区'),
  description: translate('默认包括返回按钮和全屏按钮'),
  key: 'cx-daily-page-actions',
  component,
  async: true,
})
