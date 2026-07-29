import { define } from '@lionad/cx-definition'
import component from './src/index.vue'

export default define({
  key: 'cx-nuxt-ui-v4-footer-columns',
  name: '页脚列',
  description: 'Nuxt UI v4 页脚链接列，多列链接分组展示，常置于 Footer 的 top 区',
  icon: 'i-tabler-columns',
  component,
  props: {
    columns: {
      name: '列',
      type: 'custom',
      initial: () => [
        {
          label: '产品',
          children: [
            { label: '组件文档', to: '/docs/components' },
            { label: '更新日志', to: '/releases' },
          ],
        },
        {
          label: '社区',
          children: [
            { label: 'GitHub', to: 'https://github.com/nuxt', target: '_blank' },
            { label: '讨论区', to: 'https://github.com/nuxt/discussions', target: '_blank' },
          ],
        },
      ],
    },
  },
  slots: {
    left: { key: 'left', name: '左区' },
    right: { key: 'right', name: '右区' },
  },
})
