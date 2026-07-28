import { define } from '@lionad/cx-definition'
import component from './src/index.vue'

export default define({
  name: '表单',
  description: 'Nuxt UI v4 表单容器，配合 UFormField 与 schema 做校验与提交',
  key: 'cx-nuxt-ui-v4-form',
  icon: 'i-ri-form-input',
  component,
  // UForm 的 schema / state / validate 等均为应用层语义，由使用方通过 slot 内的表单字段组合提供，
  // 故本物料不暴露核心 prop，仅作为容器渲染默认插槽。
  slots: {
    default: { key: 'default', name: '表单内容' },
  },
})
