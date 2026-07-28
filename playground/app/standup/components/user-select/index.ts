import { define, translate } from '@lionad/cx-definition'
import component from './ui/index.vue'

export default define({
  name: translate('切换站会成员'),
  description: translate('根据项目成员及此次站会的缺席情况，显示站会成员，并提供选中操作'),
  key: 'cx-user-select',
  component,
  async: true,
})
