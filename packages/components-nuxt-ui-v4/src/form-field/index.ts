import { normalize } from '@lionad/cx-definition'
import component from './src/index.vue'

export default normalize({
  name: '表单项',
  description: 'Nuxt UI v4 表单字段，v2 form-item 在 v4 对应 FormField，承载 label/校验/帮助文本',
  key: 'cx-nuxt-ui-v4-form-field',
  icon: 'i-tabler-forms',
  component,
  props: {
    label: {
      name: '标签',
      type: 'short',
      initial: '标签',
    },
    required: {
      name: '必填',
      type: 'boolean',
      initial: false,
    },
    // v4 UFormField 的 error 是 boolean | string，物料以 short 文本承载最常用的自定义错误消息。
    error: {
      name: '错误信息',
      type: 'short',
    },
    hint: {
      name: '提示',
      type: 'short',
    },
    help: {
      name: '帮助',
      type: 'short',
    },
  },
  slots: {
    default: { key: 'default', name: '字段内容' },
    label: { key: 'label', name: '标签' },
    help: { key: 'help', name: '帮助' },
    error: { key: 'error', name: '错误' },
  },
})
