import { normalize } from '@lionad/cx-definition'
import component from './src/index.vue'

export default normalize({
  key: 'cx-nuxt-ui-v4-file-upload',
  name: '文件上传',
  description: 'Nuxt UI v4 文件上传，拖拽区与按钮两种形态，支持类型限制与多选',
  icon: 'i-tabler-upload',
  component,
  props: {
    label: {
      name: '标签',
      type: 'short',
      initial: '拖拽文件到此处',
    },
    description: {
      name: '描述',
      type: 'short',
      initial: 'SVG, PNG, JPG 或 GIF（最大 2MB）',
    },
    icon: {
      name: '图标',
      type: 'short',
      initial: 'i-lucide-upload',
    },
    accept: {
      name: '类型限制',
      type: 'short',
      initial: 'image/*',
    },
    multiple: {
      name: '多选',
      type: 'switch',
    },
    variant: {
      name: '形态',
      type: 'card-selector',
      isPreview: true,
      initial: 'area',
      options: [
        { label: '拖拽区', value: 'area' },
        { label: '按钮', value: 'button' },
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
  },
  slots: {
    actions: { key: 'actions', name: '操作区' },
  },
})
