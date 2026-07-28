import { define } from '@lionad/cx-definition'
import component from './src/index.vue'

export default define({
  key: 'cx-nuxt-ui-v4-color-picker',
  name: '取色器',
  description:
    'Nuxt UI v4 取色器，支持 hex / rgb / hsl / cmyk / lab 格式；物料层 value 单向映射 default-value',
  icon: 'i-tabler-color-picker',
  component,
  props: {
    value: {
      name: '颜色值',
      type: 'short',
      initial: '#00C16A',
    },
    format: {
      name: '格式',
      type: 'card-selector',
      isPreview: true,
      initial: 'hex',
      options: [
        { label: 'HEX', value: 'hex' },
        { label: 'RGB', value: 'rgb' },
        { label: 'HSL', value: 'hsl' },
        { label: 'CMYK', value: 'cmyk' },
        { label: 'LAB', value: 'lab' },
      ],
    },
    size: {
      name: '尺寸',
      type: 'card-selector',
      isPreview: true,
      initial: 'md',
      options: [
        { label: 'xs', value: 'xs' },
        { label: 'sm', value: 'sm' },
        { label: 'md', value: 'md' },
        { label: 'lg', value: 'lg' },
        { label: 'xl', value: 'xl' },
      ],
    },
    disabled: {
      name: '禁用',
      type: 'switch',
    },
  },
})
