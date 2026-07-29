import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '描述列表',
  description:
    'Element Plus 描述列表，成组展示标签-值信息；items 为条目数组（label/value/span），其余对应 EP 同名 prop。',
  key: 'cx-element-plus-descriptions',
  icon: 'i-tabler-list-details',
  component,
  props: {
    title: {
      name: '标题',
      type: 'short',
      initial: '',
    },
    items: {
      name: '条目',
      type: 'json',
      initial: () => [
        { label: '姓名', value: 'Alice' },
        { label: '角色', value: '管理员' },
      ],
    },
    column: {
      name: '每行列数',
      type: 'number',
      initial: 3,
    },
    border: {
      name: '边框',
      type: 'boolean',
      initial: true,
    },
    size: {
      name: '尺寸',
      type: 'card-selector',
      isPreview: true,
      initial: 'default',
      options: [
        { label: '大', value: 'large' },
        { label: '默认', value: 'default' },
        { label: '小', value: 'small' },
      ],
    },
  },
})
