import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '代码差异',
  description: '代码差异对比（diff 渲染），支持 old/new 或 patch 输入，统一/分屏视图。',
  key: 'cx-vtu-code-diff',
  icon: 'i-tabler-diff',
  component,
  props: {
    oldCode: {
      name: '旧代码',
      type: 'textarea',
      initial: 'const x = 1\nconst y = 2',
    },
    newCode: {
      name: '新代码',
      type: 'textarea',
      initial: 'const x = 1\nconst y = 3\nconst z = 4',
    },
    language: {
      name: '语言',
      type: 'short',
      initial: 'typescript',
    },
    filename: {
      name: '文件名',
      type: 'short',
      initial: 'calc.ts',
    },
    diffStyle: {
      name: '视图',
      type: 'card-selector',
      isPreview: true,
      initial: 'unified',
      options: [
        { label: '统一', value: 'unified' },
        { label: '分屏', value: 'split' },
      ],
    },
  },
})
