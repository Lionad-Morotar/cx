import type { VariantRegistry } from '../../variants-utils'

// Navigation 组手写 variants：导航件。3 件 array trigger 物料（breadcrumb/stepper/tabs）
// 的主数组覆盖项与其 trigger 声明的 item 形态一致（回放剧本真实）；
// footer-columns 为 array+region 组合 trigger，variants 只覆盖 array 主数组（columns）；
// stepper 含禁用步骤混合组——步骤状态是 item 级属性（disabled），非当前步指示器。

export const navigationVariants: VariantRegistry = {
  'cx-nuxt-ui-v4-breadcrumb': [
    { label: '默认三级', data: {} },
    {
      label: '两级短链',
      data: {
        items: [
          { label: '首页', icon: 'i-heroicons-home', to: '/' },
          { label: '当前页' },
        ],
      },
    },
    {
      label: '四级深链',
      data: {
        items: [
          { label: '首页', icon: 'i-heroicons-home', to: '/' },
          { label: '文档', to: '/docs' },
          { label: '组件', to: '/docs/components' },
          { label: '按钮' },
        ],
      },
    },
  ],
  'cx-nuxt-ui-v4-command-palette': [
    { label: '默认命令面板', data: {} },
    { label: '自定义占位', data: { placeholder: '输入命令或搜索文档…' } },
  ],
  'cx-nuxt-ui-v4-footer-columns': [
    { label: '默认两列', data: {} },
    {
      label: '三列自定义',
      data: {
        columns: [
          { label: '产品', children: [{ label: '功能', to: '/features' }, { label: '定价', to: '/pricing' }] },
          { label: '资源', children: [{ label: '文档', to: '/docs' }, { label: '示例', to: '/examples' }] },
          { label: '公司', children: [{ label: '关于', to: '/about' }, { label: '招聘', to: '/jobs' }] },
        ],
      },
    },
  ],
  'cx-nuxt-ui-v4-link': [
    { label: '默认链接', data: {} },
    { label: '外部链接', data: { to: 'https://nuxt.com', label: 'Nuxt 官网' } },
  ],
  'cx-nuxt-ui-v4-navigation-menu': [
    { label: '默认横向', data: {} },
    { label: '纵向成功色', data: { orientation: 'vertical', color: 'success' } },
  ],
  'cx-nuxt-ui-v4-pagination': [
    { label: '默认百条', data: {} },
    { label: '首尾页按钮', data: { showEdges: true, total: 200 } },
    { label: '第五页双兄弟', data: { page: 5, siblingCount: 2 } },
  ],
  'cx-nuxt-ui-v4-stepper': [
    { label: '默认横向三步', data: {} },
    { label: '纵向成功色', data: { orientation: 'vertical', color: 'success' } },
    {
      label: '含禁用步骤',
      data: {
        items: [
          { title: '填写地址', description: '已完成', icon: 'i-lucide-house' },
          { title: '选择配送', description: '步骤禁用', icon: 'i-lucide-truck', disabled: true },
          { title: '确认下单', description: '未开始', icon: 'i-lucide-check' },
        ],
      },
    },
  ],
  'cx-nuxt-ui-v4-tabs': [
    { label: '默认横向', data: {} },
    { label: '纵向大号成功', data: { orientation: 'vertical', size: 'xl', color: 'success' } },
    {
      label: '三项自定义',
      data: {
        items: [
          { label: '图表', value: 'chart', icon: 'i-lucide-bar-chart' },
          { label: '表格', value: 'table', icon: 'i-lucide-table' },
          { label: '看板', value: 'board', icon: 'i-lucide-kanban' },
        ],
      },
    },
  ],
}
