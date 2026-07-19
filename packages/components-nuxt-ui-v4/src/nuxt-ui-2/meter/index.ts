import { normalize } from '@lionad/cx-definition'
import component from './src/index.vue'
import { cmptColorNames3, useSizeOptions } from '@lionad/cx-vue'
import { binds } from './slots'

export default normalize({
  key: 'cx-meter',
  name: '计量',
  description: '表示某个范围内的数值，比如进度、评分或容量使用情况。',
  icon: 'i-carbon-meter-alt',
  component,
  props: {
    value: {
      type: 'range',
      name: '值',
      min: ({ cmpt }: any) => cmpt.data?.min || 0,
      max: ({ cmpt }: any) => cmpt.data?.max || 100,
      step: 1,
    },
    min: {
      type: 'number',
      name: '最小值',
    },
    max: {
      type: 'number',
      name: '最大值',
    },
    indicator: {
      type: 'boolean',
      name: '指示器',
    },
    label: {
      type: 'short',
      name: '标签',
    },
    icon: {
      type: 'icon',
      name: '图标',
    },
    size: {
      type: 'card-selector',
      name: '尺寸',
      isPreview: true,
      options: useSizeOptions('2xs', '2xl'),
      ui: {
        item: 'w-[80%] h-28 px-4 pt-1 pb-8',
      },
    },
    color: {
      type: 'card-selector',
      name: '颜色',
      isPreview: true,
      options: cmptColorNames3,
      ui: {
        item: 'w-[80%] h-28 px-4 pt-1 pb-8',
      },
    },
  },
  slots: {
    label: {
      key: 'label',
      name: '标签',
      binds,
    },
    icon: {
      key: 'icon',
      name: '标签前图标',
    },
    indicator: {
      key: 'indicator',
      name: '指示器',
      binds,
    },
  },
})
