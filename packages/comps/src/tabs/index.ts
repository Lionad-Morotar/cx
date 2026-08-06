import { define } from '@lionad/cx-definition'
import component from './src/index.vue'

export default define({
  name: '标签页',
  icon: 'i-tabler-folder',
  description: '标签页容器：按 tab 切换展示各命名插槽面板，面板内容经插槽子树组装',
  key: 'cx-tabs',
  component,
  props: {
    tabs: {
      name: '标签项',
      type: 'json',
      description: '形如 [{ key, label }]，key 决定插槽名（tab-<key>）',
      initial: () => [
        { key: 'tab-1', label: '标签一' },
        { key: 'tab-2', label: '标签二' },
      ],
    },
    activeKey: {
      name: '激活项',
      type: 'short',
      description: '当前激活 tab 的 key；缺省取首个 tab',
      initial: '',
    },
  },
  slots: ({ comp }) => {
    const tabs = Array.isArray(comp?.data?.tabs)
      ? (comp.data.tabs as { key?: unknown; label?: unknown }[])
      : []
    return tabs
      .filter((t) => typeof t?.key === 'string' && t.key)
      .map((t) => ({
        key: `tab-${t.key}`,
        name: `面板（${typeof t.label === 'string' ? t.label : t.key}）`,
        description: '',
      }))
  },
})
