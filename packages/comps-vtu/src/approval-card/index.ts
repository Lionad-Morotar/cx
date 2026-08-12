import { define } from '@lionad/cx-definition'

import component from './src/index.vue'

export default define({
  name: '审批卡',
  description: '审批确认卡，含标题、描述、元数据与确认/取消动作，支持破坏性变体。',
  key: 'cx-vtu-approval-card',
  icon: 'i-tabler-shield-check',
  component,
  props: {
    title: {
      name: '标题',
      type: 'short',
      initial: '确认部署到生产环境？',
    },
    description: {
      name: '描述',
      type: 'textarea',
      initial: '此操作将把 v1.2.0 发布到生产集群。',
    },
    variant: {
      name: '变体',
      type: 'card-selector',
      isPreview: true,
      initial: 'default',
      options: [
        { label: '默认', value: 'default' },
        { label: '破坏性', value: 'destructive' },
      ],
    },
    confirmLabel: {
      name: '确认文案',
      type: 'short',
      initial: '确认',
    },
    cancelLabel: {
      name: '取消文案',
      type: 'short',
      initial: '取消',
    },
    metadata: {
      name: '元数据',
      type: 'json',
      initial: () => [
        { key: '环境', value: 'production' },
        { key: '版本', value: 'v1.2.0' },
      ],
    },
  },
  // emits 与 SFC defineEmits 同集合:声明后 cx 渲染器 getEmits 命中,经 _cx_events 接到 host
  emits: {
    confirm: {
      name: '确认',
      description: '用户点击确认按钮,载荷为 confirmLabel(未配时 undefined,语义层落兜底「批准」)',
    },
    cancel: { name: '取消', description: '用户点击取消按钮,宿主回写「取消执行」' },
  },
})
