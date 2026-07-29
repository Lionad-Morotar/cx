import { define } from '@lionad/cx-definition'
import component from './src/index.vue'

export default define({
  key: 'cx-nuxt-ui-v4-input-number',
  name: '数字输入',
  description: 'Nuxt UI v4 数字输入，范围/步长可定制；物料层 value 单向映射 default-value',
  icon: 'i-tabler-number',
  component,
  props: {
    value: {
      name: '当前值',
      type: 'number',
      initial: 5,
    },
    min: {
      name: '最小值',
      type: 'number',
      initial: 0,
    },
    max: {
      name: '最大值',
      type: 'number',
      initial: 100,
    },
    step: {
      name: '步长',
      type: 'number',
      initial: 1,
    },
    placeholder: {
      name: '占位文本',
      type: 'short',
      initial: '',
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
    disabled: {
      name: '禁用',
      type: 'switch',
    },
  },
})
