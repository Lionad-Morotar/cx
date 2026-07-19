import z from 'zod'
import { normalize } from '@lionad/cx-definition'
import component from './src/index.vue'
import { cmptColorNames3 , useSizeOptions} from '@lionad/cx-vue'

export default normalize({
  key: 'cx-toggle',
  name: '开关',
  description: '开关组件',
  icon: 'i-tabler-toggle-left',
  component,
  props: {
    dftValue: {
      type: 'boolean',
      name: '默认打开',
      initial: false
    },
    onIcon: {
      type: 'icon',
      name: '激活时图标'
    },
    offIcon: {
      type: 'icon',
      name: '关闭时图标'
    },
    disabled: {
      type: 'boolean',
      name: '禁用',
      initial: false
    },
    loading: {
      type: 'boolean',
      name: '加载中',
      initial: false
    },
    size: {
      type: 'card-selector',
      name: '大小',
      isPreview: true,
      options: useSizeOptions('2xs', 'xl')
    },
    color: {
      type: 'card-selector',
      name: '颜色',
      isPreview: true,
      options: cmptColorNames3,
      pickData: ({ data }: any) => ({ ...data, dftValue: true })
    }
  },
  emits: {
    change: {
      name: '开关改变',
      description: '当开关状态变化时触发',
      schema: z.boolean()
    }
  }
})
