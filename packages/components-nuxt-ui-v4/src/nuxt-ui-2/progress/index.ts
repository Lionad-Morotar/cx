import { normalize , safeNum} from '@lionad/cx-definition'
import component from './src/index.vue'
import { cmptColorNames3 , useSizeOptions} from '@lionad/cx-vue'
import PanelItems from './panel/items.vue'
import { binds } from './slots'

export default normalize({
  key: 'cx-progress',
  name: '进度条',
  description: '进度条组件用于展示线性的进度状态，也可以展示百分比等数值形式的状态',
  icon: 'i-carbon-progress-bar',
  component,
  props: {
    value: {
      type: 'range',
      name: '进度',
      min: ({ cmpt }: any) => cmpt.data?.min || 0,
      max: ({ cmpt }: any) => {
        return cmpt.data?.type === 'number'
          ? safeNum(cmpt.data?.max)
          : cmpt.data?.type === 'label'
            ? (cmpt.data?.maxItems || []).length - 1
            : undefined
      },
      step: 1
    },
    type: {
      type: 'select',
      name: '进度类型',
      initial: 'number',
      options: [
        { label: '数值', value: 'number' },
        { label: '标签', value: 'label' }
      ]
    },
    max: {
      type: 'number',
      name: '最大值',
      hidden: ({ cmpt }: any) => cmpt.data?.type !== 'number'
    },
    // todo combine with max
    maxItems: {
      type: 'custom',
      name: '最大值',
      component: PanelItems,
      initial: () => [],
      hidden: ({ cmpt }: any) => cmpt.data?.type !== 'label'
    },
    indicator: {
      type: 'boolean',
      name: '指示器',
      hidden: ({ cmpt }: any) => cmpt.data?.type === 'label'
    },
    animation: {
      type: 'card-selector',
      name: '动画',
      help: '当值为空时，如果设置了动画，进度条会自动播放',
      isPreview: true,
      options: [
        { value: 'carousel', label: '轮播' },
        { value: 'carousel-inverse', label: '轮播反向' },
        { value: 'swing', label: '摇摆' },
        { value: 'elastic', label: '弹性' }
      ],
      ui: {
        item: 'w-[80%] h-28 px-4 pt-1 pb-8'
      }
    },
    size: {
      type: 'card-selector',
      name: '尺寸',
      isPreview: true,
      options: useSizeOptions('2xs', '2xl'),
      ui: {
        item: 'w-[80%] h-28 px-4 pt-1 pb-8'
      }
    },
    color: {
      type: 'card-selector',
      name: '颜色',
      isPreview: true,
      options: cmptColorNames3,
      ui: {
        item: 'w-[80%] h-28 px-4 pt-1 pb-8'
      }
    }
  },
  slots: ({ cmpt }: any) => {
    const res = []
    if (cmpt.data?.type !== 'label') {
      res.push({
        key: 'indicator',
        name: '指示器',
        binds: {
          percent: binds.percent
        }
      })
    }
    if (cmpt.data?.type === 'label') {
      const items = cmpt.data?.maxItems || []
      items.forEach((item: any, index: any) => {
        res.push({
          key: `step-${index}`,
          name: item.label,
          binds: {
            step: binds.step
          }
        })
      })
    }
    return res
  }
})
