import { normalize } from '@lionad/cx-definition'
import component from './src/index.vue'

export default normalize({
  key: 'cx-nuxt-ui-v4-tree',
  name: '树',
  description: 'Nuxt UI v4 树视图，层级数据展示与交互',
  icon: 'i-tabler-hierarchy',
  component,
  props: {
    items: {
      name: '节点',
      type: 'custom',
      initial: () => [
        {
          label: 'app/',
          defaultExpanded: true,
          children: [
            {
              label: 'components/',
              children: [{ label: 'Button.vue', icon: 'i-vscode-icons-file-type-vue' }],
            },
            {
              label: 'composables/',
              children: [{ label: 'useAuth.ts', icon: 'i-vscode-icons-file-type-typescript' }],
            },
          ],
        },
        { label: 'nuxt.config.ts', icon: 'i-vscode-icons-file-type-nuxt' },
      ],
    },
    multiple: {
      name: '多选',
      type: 'switch',
    },
  },
})
