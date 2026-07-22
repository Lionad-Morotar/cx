import { normalize } from '@lionad/cx-definition'

import component from './src/index.vue'

export default normalize({
  name: '引用',
  description: '来源引用卡，含链接、标题、摘要、域名与跳转事件，支持多种变体。',
  key: 'cx-vtu-citation',
  icon: 'i-tabler-quote',
  component,
  props: {
    href: {
      name: '链接',
      type: 'short',
      initial: 'https://example.com/article',
    },
    title: {
      name: '标题',
      type: 'short',
      initial: '引用的文章标题',
    },
    snippet: {
      name: '摘要',
      type: 'textarea',
      initial: '与当前内容相关的引用片段。',
    },
    domain: {
      name: '域名',
      type: 'short',
      initial: 'example.com',
    },
    variant: {
      name: '变体',
      type: 'card-selector',
      isPreview: true,
      initial: 'default',
      options: [
        { label: '默认', value: 'default' },
        { label: '行内', value: 'inline' },
        { label: '堆叠', value: 'stacked' },
      ],
    },
  },
})
