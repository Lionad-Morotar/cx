import { define } from '@lionad/cx-definition'
import { useSizeOptions } from '@lionad/cx-vue'
import component from './src/index.vue'

const VARIANT_OPTIONS = [
  { label: '线框', value: 'outline' },
  { label: '柔和', value: 'soft' },
  { label: '次级', value: 'subtle' },
  { label: '幽灵', value: 'ghost' },
  { label: '无', value: 'none' },
]

const COLOR_OPTIONS = [
  { label: '主要', value: 'primary' },
  { label: '次要', value: 'secondary' },
  { label: '成功', value: 'success' },
  { label: '信息', value: 'info' },
  { label: '警告', value: 'warning' },
  { label: '错误', value: 'error' },
  { label: '中性', value: 'neutral' },
]

export default define({
  name: '文本域',
  description: 'Nuxt UI v4 多行文本输入，支持行数与自适应高度',
  key: 'cx-nuxt-ui-v4-textarea',
  icon: 'i-ri-text-spacing',
  component,
  props: {
    placeholder: {
      name: '占位符',
      type: 'short',
      initial: '请输入',
    },
    rows: {
      name: '行数',
      type: 'number',
      initial: 3,
    },
    autoresize: {
      name: '自适应高度',
      type: 'boolean',
      initial: false,
    },
    disabled: {
      name: '禁用',
      type: 'boolean',
      initial: false,
    },
    size: {
      name: '尺寸',
      type: 'card-selector',
      isPreview: true,
      initial: 'md',
      options: useSizeOptions('2xs', 'xl'),
    },
    variant: {
      name: '样式',
      type: 'card-selector',
      isPreview: true,
      initial: 'outline',
      options: VARIANT_OPTIONS,
    },
    color: {
      name: '颜色',
      type: 'card-selector',
      isPreview: true,
      initial: 'primary',
      options: COLOR_OPTIONS,
    },
  },
  slots: {
    default: { key: 'default', name: '内容' },
  },
})
