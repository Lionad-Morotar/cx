import { define } from '@lionad/cx-definition'
import { useSizeOptions } from '@lionad/cx-vue'
import component from './src/index.vue'

// v4 Input 的 variant 取值集合为 outline/soft/subtle/ghost/none（见 theme/input.ts），
// 与按钮的 solid/outline/.../link 不同，此处按 v4 源码给出输入型组件通用 variant。
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
  name: '输入框',
  description: 'Nuxt UI v4 单行输入框，承载文本/数字/密码等基础录入',
  key: 'cx-nuxt-ui-v4-input',
  icon: 'i-ri-input-field',
  component,
  props: {
    placeholder: {
      name: '占位符',
      type: 'short',
      initial: '请输入',
    },
    type: {
      name: '输入类型',
      type: 'select',
      initial: 'text',
      options: [
        { label: '文本', value: 'text' },
        { label: '数字', value: 'number' },
        { label: '密码', value: 'password' },
      ],
    },
    size: {
      name: '尺寸',
      type: 'card-selector',
      isPreview: true,
      initial: 'md',
      options: useSizeOptions('2xs', 'xl'),
    },
    color: {
      name: '颜色',
      type: 'card-selector',
      isPreview: true,
      initial: 'primary',
      options: COLOR_OPTIONS,
    },
    variant: {
      name: '样式',
      type: 'card-selector',
      isPreview: true,
      initial: 'outline',
      options: VARIANT_OPTIONS,
    },
    disabled: {
      name: '禁用',
      type: 'boolean',
      initial: false,
    },
    icon: {
      name: '图标',
      type: 'icon',
    },
  },
  slots: {
    leading: { key: 'leading', name: '输入前' },
    trailing: { key: 'trailing', name: '输入后' },
  },
})
