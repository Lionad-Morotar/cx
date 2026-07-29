import { define } from '@lionad/cx-definition'
import component from './src/index.vue'
import { useSizeOptions } from '@lionad/cx-vue'

export default define({
  key: 'cx-nuxt-ui-v4-tabs',
  name: '标签页',
  description: 'Nuxt UI v4 标签页，切换不同分组内容',
  icon: 'i-ph-tabs',
  component,
  props: {
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
    size: {
      name: '尺寸',
      type: 'card-selector',
      isPreview: true,
      initial: 'md',
      options: useSizeOptions('2xs', 'xl'),
    },
    orientation: {
      name: '方向',
      type: 'card-selector',
      isPreview: true,
      initial: 'horizontal',
      options: [
        { label: '水平', value: 'horizontal' },
        { label: '垂直', value: 'vertical' },
      ],
    },
    items: {
      name: '标签项',
      type: 'custom',
      initial: () => [
        { label: '概览', value: 'overview', icon: 'i-heroicons-home' },
        { label: '设置', value: 'settings', icon: 'i-heroicons-cog-6-tooth' },
      ],
    },
  },
  slots: {
    // v4 Tabs 的 #default 渲染每个 trigger 标签；#content 渲染对应面板内容
    default: { key: 'default', name: '标签' },
    leading: { key: 'leading', name: '标签前' },
    trailing: { key: 'trailing', name: '标签后' },
    content: { key: 'content', name: '面板内容' },
  },
})
