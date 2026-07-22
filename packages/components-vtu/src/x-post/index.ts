import { normalize } from '@lionad/cx-definition'

import component from './src/index.vue'

export default normalize({
  name: 'X 贴文',
  description: 'X / Twitter 贴文展示，post 对象含作者（头像须为 URL）、文本、媒体与统计。',
  key: 'cx-vtu-x-post',
  icon: 'i-tabler-brand-x',
  component,
  props: {
    post: {
      name: '贴文数据',
      type: 'json',
      initial: () => ({
        id: 'x-1',
        author: {
          name: '示例用户',
          handle: 'demo_user',
          avatarUrl: 'https://picsum.photos/seed/x/80',
          verified: true,
        },
        text: '一段 X 贴文正文，支持 #话题 与 @提及。',
        stats: { likes: 42 },
      }),
    },
  },
})
