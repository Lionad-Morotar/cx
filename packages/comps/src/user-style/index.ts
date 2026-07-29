import { define } from '@lionad/cx-definition'
import component from './src/ui/index.vue'

export default define({
  name: '自定义样式',
  icon: 'i-ant-design-skin-outlined',
  description: '自定义样式用来设定组件或者页面级别的CSS代码。',
  key: 'cx-user-style',
  component,
  props: {
    userStyle: {
      name: 'CSS',
      type: 'short',
      initial: '',
    },
  },
  slots: {
    default: {
      key: 'default',
      name: '样式影响区域',
    },
  },
})
