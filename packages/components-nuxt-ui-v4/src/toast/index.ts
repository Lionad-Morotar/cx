import { normalize } from '@lionad/cx-definition'
import component from './src/index.vue'

export default normalize({
  key: 'cx-nuxt-ui-v4-toast',
  name: '通知',
  description: 'Nuxt UI v4 单条通知（UToast）；完整通知流需配合 useToast API 与 UToaster 容器',
  icon: 'i-ant-design-notification-outlined',
  // 编程式物料：UToast 依赖 useToast 创建的通知实例上下文，画布静态渲染为空，
  // 标 headless 让验收页以"逻辑型物料"占位而非呈现空卡片
  headless: true,
  component,
  props: {
    title: {
      name: '通知标题',
      type: 'short',
      initial: '通知标题',
    },
    description: {
      name: '通知描述',
      type: 'short',
      initial: '通知描述内容',
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
    icon: {
      name: '图标',
      type: 'icon',
      initial: '',
    },
    // v4 prop 名为 duration（非 spec 的 timeout），以 v4 源码为准
    duration: {
      name: '自动关闭时长（毫秒）',
      type: 'number',
      initial: 5000,
    },
  },
  slots: {
    title: { key: 'title', name: '标题' },
    description: { key: 'description', name: '描述' },
    leading: { key: 'leading', name: '前导' },
    actions: { key: 'actions', name: '操作' },
  },
})
