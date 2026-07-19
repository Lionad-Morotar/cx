import { normalize, translate } from '@lionad/cx-definition'
import component from './ui/index.vue'

export default normalize({
  name: translate('区域折叠组件'),
  description: translate(
    '区域折叠组件是一个分为头部和内容两部分的卡片，可以使用按钮将内容区域收起或展开',
  ),
  key: 'cx-folder-container',
  component,
  async: true,
})
