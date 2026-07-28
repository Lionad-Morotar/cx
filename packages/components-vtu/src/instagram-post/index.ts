import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: 'Instagram 贴文',
  description: 'Instagram 贴文展示，post 对象含作者、文本、媒体与统计。',
  key: 'cx-vtu-instagram-post',
  icon: 'i-tabler-brand-instagram',
  component,
  props: {
    post: {
      name: '贴文数据',
      type: 'json',
      initial: () => ({
        id: 'ig-1',
        author: {
          name: '示例用户',
          handle: 'demo_user',
          avatarUrl: 'https://picsum.photos/seed/ig/80',
        },
        text: '一段 Instagram 贴文正文 #demo',
      }),
    },
  },
})
