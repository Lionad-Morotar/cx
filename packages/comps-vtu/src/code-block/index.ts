import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '代码块',
  description: '语法高亮代码块（shiki），支持行号、文件名、高亮行与折叠。',
  key: 'cx-vtu-code-block',
  icon: 'i-tabler-code',
  component,
  props: {
    code: {
      name: '代码',
      type: 'textarea',
      initial: 'function greet(name: string) {\n  return `Hello, ${name}!`\n}',
    },
    language: {
      name: '语言',
      type: 'short',
      initial: 'typescript',
    },
    filename: {
      name: '文件名',
      type: 'short',
      initial: 'greet.ts',
    },
    lineNumbers: {
      name: '行号',
      type: 'card-selector',
      isPreview: true,
      initial: 'visible',
      options: [
        { label: '显示', value: 'visible' },
        { label: '隐藏', value: 'hidden' },
      ],
    },
    highlightLines: {
      name: '高亮行',
      type: 'json',
      initial: () => [2],
    },
  },
})
