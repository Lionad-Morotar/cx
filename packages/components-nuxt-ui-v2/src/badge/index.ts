import { define } from '@lionad/cx-definition'
import { compColorNames, useSizeOptions } from '@lionad/cx-vue'
import component from './src/index.vue'

export default define({
  name: '标签',
  description: '标签组件用于展示事物的状态、数量等附加信息',
  key: 'cx-badge',
  icon: 'i-tabler-hash',
  component,
  props: {
    prefix: {
      name: '前缀',
      type: 'short',
      initial: '#',
      hidden: ({ comp }: any) => comp.components?.['leading']?.length > 0,
    },
    label: {
      name: '文本',
      type: 'short',
      initial: '标签',
      hidden: ({ comp }: any) => comp.components?.['default']?.length > 0,
    },
    postfix: {
      name: '后缀',
      type: 'short',
      initial: '',
      hidden: ({ comp }: any) => comp.components?.['trailing']?.length > 0,
    },
    variant: {
      type: 'card-selector',
      name: '警告样式',
      isPreview: true,
      options: [
        {
          value: 'solid',
          label: '实心',
        },
        {
          value: 'outline',
          label: '描边',
        },
        {
          value: 'subtle',
          label: '低调',
        },
        {
          value: 'soft',
          label: '柔和',
        },
      ],
    },
    color: {
      type: 'card-selector',
      name: '颜色',
      isPreview: true,
      options: compColorNames,
    },
    size: {
      type: 'card-selector',
      name: '尺寸',
      options: useSizeOptions('xs', 'lg'),
      isPreview: true,
    },
    round: {
      name: '圆角',
      type: 'switch',
    },
  },
  slots: {
    leading: {
      key: 'leading',
      name: '内容前',
    },
    default: {
      key: 'default',
      name: '内容',
    },
    trailing: {
      key: 'trailing',
      name: '内容后',
    },
  },
})
