import { define } from '@lionad/cx-definition'
import component from './src/index.vue'

export default define({
  name: '文档页面',
  icon: 'i-ant-design-layout-outlined',
  description: '页面组件，提供经典的网页页面布局形式，如侧边栏+内容布局、双栏布局、圣杯布局等',
  key: 'cx-page',
  component,

  slots: {
    default: {
      key: 'default',
      name: '主要内容区',
    },
  },
})
