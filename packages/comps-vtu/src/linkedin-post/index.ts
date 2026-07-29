import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: 'LinkedIn 贴文',
  description: 'LinkedIn 贴文展示，post 对象含作者（可选头衔）、文本与链接预览。',
  key: 'cx-vtu-linkedin-post',
  icon: 'i-tabler-brand-linkedin',
  component,
  props: {
    post: {
      name: '贴文数据',
      type: 'json',
      initial: () => ({
        id: 'li-1',
        author: {
          name: '示例作者',
          handle: 'demo-author',
          avatarUrl: 'https://picsum.photos/seed/li/80',
          headline: '前端工程师',
        },
        text: '一段关于技术分享的 LinkedIn 动态。',
      }),
    },
  },
})
