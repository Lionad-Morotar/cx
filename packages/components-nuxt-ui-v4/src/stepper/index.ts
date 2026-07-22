import { normalize } from '@lionad/cx-definition'
import component from './src/index.vue'

export default normalize({
  key: 'cx-nuxt-ui-v4-stepper',
  name: '步骤条',
  description: 'Nuxt UI v4 步骤条，多步流程进度指示，点击步骤可导航',
  icon: 'i-tabler-list-numbers',
  component,
  props: {
    items: {
      name: '步骤',
      type: 'custom',
      initial: () => [
        { title: '填写地址', description: '补充收货地址', icon: 'i-lucide-house' },
        { title: '选择配送', description: '设置配送方式', icon: 'i-lucide-truck' },
        { title: '确认下单', description: '核对订单信息', icon: 'i-lucide-check' },
      ],
    },
    color: {
      name: '颜色',
      type: 'card-selector',
      isPreview: true,
      initial: 'primary',
      options: [
        { label: '主要', value: 'primary' },
        { label: '次要', value: 'secondary' },
        { label: '成功', value: 'success' },
        { label: '信息', value: 'info' },
        { label: '警告', value: 'warning' },
        { label: '错误', value: 'error' },
        { label: '中性', value: 'neutral' },
      ],
    },
    orientation: {
      name: '方向',
      type: 'card-selector',
      isPreview: true,
      initial: 'horizontal',
      options: [
        { label: '水平', value: 'horizontal' },
        { label: '垂直', value: 'vertical' },
      ],
    },
  },
})
