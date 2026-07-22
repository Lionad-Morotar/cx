import { normalize } from '@lionad/cx-definition'

import component from './src/index.vue'

export default normalize({
  name: '联系卡',
  description: '联系方式卡，按类型（电话/邮箱/地址/社交/网站）展示值，可复制或跳转。',
  key: 'cx-vtu-contact-card',
  icon: 'i-tabler-address-book',
  component,
  props: {
    kind: {
      name: '类型',
      type: 'card-selector',
      isPreview: true,
      initial: 'email',
      options: [
        { label: '电话', value: 'phone' },
        { label: '邮箱', value: 'email' },
        { label: '地址', value: 'address' },
        { label: 'WhatsApp', value: 'whatsapp' },
        { label: '微信', value: 'wechat' },
        { label: '网站', value: 'website' },
        { label: '其他', value: 'other' },
      ],
    },
    value: {
      name: '值',
      type: 'short',
      initial: 'hi@example.com',
    },
    label: {
      name: '标签',
      type: 'short',
      initial: '工作邮箱',
    },
    description: {
      name: '描述',
      type: 'short',
      initial: '工作日 9-18 点回复',
    },
    copyable: {
      name: '可复制',
      type: 'switch',
      initial: true,
    },
  },
})
