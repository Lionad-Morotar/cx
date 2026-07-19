import z from 'zod'
import { normalize , safeNum} from '@lionad/cx-definition'
import component from './src/index.vue'
import { cmptColorNames3 , useSizeOptions} from '@lionad/cx-vue'

export default normalize({
  key: 'cx-range',
  name: '范围',
  description: '范围组件用于表示某个范围内的数值，比如进度、评分或容量使用情况。',
  icon: 'i-radix-icons-slider',
  component,
  props: {
    min: {
      type: 'number',
      name: '最小值'
    },
    max: {
      type: 'number',
      name: '最大值'
    },
    step: {
      type: 'number',
      name: '步长',
      initial: 1,
      min: ({ cmpt }: any) => Math.max(safeNum(cmpt.data?.min || 0) + 1, 0),
      max: ({ cmpt }: any) => Math.min(safeNum(cmpt.data?.max || 100), 100),
      step: 1
    },
    disabled: {
      type: 'boolean',
      name: '禁用'
    },
    size: {
      type: 'card-selector',
      name: '尺寸',
      isPreview: true,
      options: useSizeOptions('2xs', '2xl')
    },
    color: {
      type: 'card-selector',
      name: '颜色',
      isPreview: true,
      options: cmptColorNames3
    }
  },
  emits: {
    change: {
      name: '选中变化',
      description: '当选中状态变化时触发',
      schema: z.boolean()
    }
  }
})
