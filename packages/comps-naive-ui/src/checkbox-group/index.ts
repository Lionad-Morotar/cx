import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '多选组',
  description: 'Naive UI 多选组；options 为选项数组（label/value），value 为选中值数组，变更经 update:value 桥接上行。',
  key: 'cx-naive-ui-checkbox-group',
  icon: 'i-tabler-checkbox',
  component,
  props: {
    options: {
      name: '选项',
      type: 'json',
      initial: () => [
        { label: '甲', value: 'a' },
        { label: '乙', value: 'b' },
      ],
    },
    value: {
      name: '值',
      type: 'json',
      initial: () => ['a'],
    },
    disabled: {
      name: '禁用',
      type: 'boolean',
      initial: false,
    },
  },
})
