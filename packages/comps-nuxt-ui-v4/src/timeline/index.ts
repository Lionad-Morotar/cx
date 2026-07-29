import { define } from '@lionad/cx-definition'
import component from './src/index.vue'

export default define({
  key: 'cx-nuxt-ui-v4-timeline',
  name: '时间线',
  description: 'Nuxt UI v4 时间线，按序展示事件（日期/标题/图标）',
  icon: 'i-tabler-timeline',
  component,
  props: {
    items: {
      name: '事件',
      type: 'custom',
      initial: () => [
        {
          date: '3 月 15 日',
          title: '项目启动',
          description: '团队对齐与里程碑制定',
          icon: 'i-lucide-rocket',
        },
        {
          date: '3 月 22 日',
          title: '设计阶段',
          description: '用研与设计工作坊',
          icon: 'i-lucide-palette',
        },
        {
          date: '3 月 29 日',
          title: '开发冲刺',
          description: '核心功能实现与联调',
          icon: 'i-lucide-code',
        },
      ],
    },
    color: {
      name: '颜色',
      type: 'card-selector',
      isPreview: true,
      initial: 'primary',
      options: [
        { label: '主要', value: 'primary' },
        { label: '次要', value: 'secondary' },
        { label: '成功', value: 'success' },
        { label: '信息', value: 'info' },
        { label: '警告', value: 'warning' },
        { label: '错误', value: 'error' },
        { label: '中性', value: 'neutral' },
      ],
    },
  },
})
