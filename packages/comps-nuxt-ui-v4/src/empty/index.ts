import { define } from '@lionad/cx-definition'
import component from './src/index.vue'

export default define({
  key: 'cx-nuxt-ui-v4-empty',
  name: '空状态',
  description: 'Nuxt UI v4 空状态，图标/标题/描述/操作按钮组合；loading 切换加载态',
  icon: 'i-tabler-box',
  component,
  props: {
    title: {
      name: '标题',
      type: 'short',
      initial: '暂无数据',
    },
    description: {
      name: '描述',
      type: 'short',
      initial: '当前列表为空，创建一条数据开始使用',
    },
    icon: {
      name: '图标',
      type: 'short',
      initial: 'i-lucide-file',
    },
    loading: {
      name: '加载中',
      type: 'switch',
    },
    variant: {
      name: '样式',
      type: 'card-selector',
      isPreview: true,
      initial: 'outline',
      options: [
        { label: '线框', value: 'outline' },
        { label: '实心', value: 'solid' },
        { label: '柔和', value: 'soft' },
        { label: '次级', value: 'subtle' },
      ],
    },
  },
})
