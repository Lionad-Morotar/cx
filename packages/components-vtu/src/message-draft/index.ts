import { normalize } from '@lionad/cx-definition'

import component from './src/index.vue'

export default normalize({
  name: '消息草稿',
  description: '邮件 / Slack 草稿预览，按渠道切换字段，含发送/撤销/取消回调。',
  key: 'cx-vtu-message-draft',
  icon: 'i-tabler-message-circle-edit',
  component,
  props: {
    channel: {
      name: '渠道',
      type: 'card-selector',
      isPreview: true,
      initial: 'email',
      options: [
        { label: '邮件', value: 'email' },
        { label: 'Slack', value: 'slack' },
      ],
    },
    body: {
      name: '正文',
      type: 'textarea',
      initial: '你好，这是一封待发送的草稿邮件。',
    },
    subject: {
      name: '主题',
      type: 'short',
      initial: '关于下周的同步',
    },
    to: {
      name: '收件人',
      type: 'json',
      initial: () => ['team@example.com'],
    },
  },
})
