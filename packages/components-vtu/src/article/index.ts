import { normalize } from '@lionad/cx-definition'

import component from './src/index.vue'

export default normalize({
  name: '文章',
  description: 'Markdown / HTML 文章卡片，支持标题、作者、封面、标签与阅读时长。',
  key: 'cx-vtu-article',
  icon: 'i-tabler-article',
  component,
  props: {
    type: {
      name: '内容类型',
      type: 'card-selector',
      isPreview: true,
      initial: 'md',
      options: [
        { label: 'Markdown', value: 'md' },
        { label: 'HTML', value: 'html' },
      ],
    },
    content: {
      name: '正文',
      type: 'textarea',
      initial:
        '## 概述\n\nvtu 物料把工具调用结果渲染为**自包含**组件。\n\n- 支持列表\n- 支持 `代码`',
    },
    title: {
      name: '标题',
      type: 'short',
      initial: 'Schema 驱动的组件渲染',
    },
    description: {
      name: '摘要',
      type: 'short',
      initial: '一段关于物料包装的简短摘要。',
    },
    author: {
      name: '作者',
      type: 'json',
      initial: () => ({ name: 'Lionad' }),
    },
    tags: {
      name: '标签',
      type: 'json',
      initial: () => ['vue', 'low-code'],
    },
    readingTime: {
      name: '阅读时长',
      type: 'short',
      initial: '3 min',
    },
  },
})
