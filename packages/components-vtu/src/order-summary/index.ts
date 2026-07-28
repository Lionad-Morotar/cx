import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '订单摘要',
  description: '订单摘要/收据，items 含数量与单价，pricing 含小计/税额/总计与币种。',
  key: 'cx-vtu-order-summary',
  icon: 'i-tabler-receipt',
  component,
  props: {
    title: {
      name: '标题',
      type: 'short',
      initial: '订单摘要',
    },
    variant: {
      name: '变体',
      type: 'card-selector',
      isPreview: true,
      initial: 'summary',
      options: [
        { label: '摘要', value: 'summary' },
        { label: '收据', value: 'receipt' },
      ],
    },
    items: {
      name: '商品',
      type: 'json',
      initial: () => [
        { id: 'p1', name: '专业版', quantity: 1, unitPrice: 99 },
        { id: 'p2', name: '附加席位', quantity: 3, unitPrice: 19 },
      ],
    },
    pricing: {
      name: '价格',
      type: 'json',
      initial: () => ({ subtotal: 156, tax: 14, total: 170, currency: 'CNY' }),
    },
  },
})
