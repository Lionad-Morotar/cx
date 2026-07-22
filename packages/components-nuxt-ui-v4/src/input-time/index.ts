import { normalize } from '@lionad/cx-definition'
import component from './src/index.vue'

export default normalize({
  key: 'cx-nuxt-ui-v4-input-time',
  name: '时间输入',
  description:
    'Nuxt UI v4 时间输入，支持范围选择与 12/24 小时制；时间值由宿主 @internationalized/date 驱动，物料层聚焦展示配置',
  icon: 'i-tabler-clock',
  component,
  props: {
    range: {
      name: '范围选择',
      type: 'switch',
    },
    hourCycle: {
      name: '小时制',
      type: 'card-selector',
      isPreview: true,
      initial: 24,
      options: [
        { label: '24 小时制', value: 24 },
        { label: '12 小时制', value: 12 },
      ],
    },
    icon: {
      name: '图标',
      type: 'short',
      initial: 'i-lucide-clock',
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
    disabled: {
      name: '禁用',
      type: 'switch',
    },
  },
})
