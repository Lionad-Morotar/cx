import type { VariantRegistry } from '../../variants-utils'

// Data 组手写 variants：数据展示件。5 件 array trigger 物料（accordion/carousel/
// table/timeline/tree）的主数组覆盖项与其 trigger 声明的 item 形态一致（回放剧本真实）；
// table 含空态透传组（data: [] 与 trigger 的 emptyPassthrough 语义呼应）；
// empty/user 为 scalar trigger 物料，marquee/scroll-area 为展示容器（无 trigger 走兜底）。

export const dataVariants: VariantRegistry = {
  'cx-nuxt-ui-v4-accordion': [
    { label: '默认两项', data: {} },
    { label: '多项展开', data: { multiple: true } },
    {
      label: '三项自定义',
      data: {
        items: [
          { label: '是什么', content: 'Schema 驱动的组件渲染系统' },
          { label: '怎么用', content: 'LLM 输出 data，物料负责渲染' },
          { label: '常见问题', content: '流式截断永远落在属性闭合处' },
        ],
      },
    },
  ],
  'cx-nuxt-ui-v4-carousel': [
    { label: '默认循环', data: {} },
    { label: '无箭头无圆点', data: { arrows: false, dots: false } },
    {
      label: '五项不循环',
      data: {
        loop: false,
        items: [
          { content: '首页' },
          { content: '产品' },
          { content: '价格' },
          { content: '关于' },
          { content: '联系' },
        ],
      },
    },
  ],
  'cx-nuxt-ui-v4-empty': [
    { label: '默认空态', data: {} },
    { label: '柔和搜索空态', data: { variant: 'soft', title: '没有搜索结果', description: '换个关键词试试' } },
    { label: '加载中', data: { loading: true, title: '正在加载' } },
  ],
  'cx-nuxt-ui-v4-marquee': [
    { label: '默认横向', data: {} },
    { label: '悬停暂停反向', data: { pauseOnHover: true, reverse: true } },
    { label: '纵向重复八', data: { orientation: 'vertical', repeat: 8 } },
  ],
  'cx-nuxt-ui-v4-scroll-area': [
    { label: '默认纵向', data: {} },
    { label: '横向', data: { orientation: 'horizontal' } },
  ],
  'cx-nuxt-ui-v4-table': [
    { label: '默认数据表', data: {} },
    { label: '空态透传', data: { data: [] } },
    {
      label: '三列自定义',
      data: {
        columns: [
          { accessorKey: 'name', header: '姓名' },
          { accessorKey: 'role', header: '角色' },
          { accessorKey: 'status', header: '状态' },
        ],
        data: [
          { id: 1, name: '王五', role: '访客', status: '离线' },
          { id: 2, name: '赵六', role: '成员', status: '在线' },
        ],
      },
    },
  ],
  'cx-nuxt-ui-v4-timeline': [
    { label: '默认三项', data: {} },
    { label: '成功色', data: { color: 'success' } },
    {
      label: '自定义两项',
      data: {
        items: [
          { date: '8 月 1 日', title: '需求评审', description: '范围确认', icon: 'i-lucide-clipboard-check' },
          { date: '8 月 2 日', title: '开发启动', description: '切片开发', icon: 'i-lucide-code' },
        ],
      },
    },
  ],
  'cx-nuxt-ui-v4-tree': [
    { label: '默认目录树', data: {} },
    { label: '多选', data: { multiple: true } },
    {
      label: '扁平节点',
      data: { items: [{ label: 'README.md' }, { label: 'package.json' }] },
    },
  ],
  'cx-nuxt-ui-v4-user': [
    { label: '默认张三', data: {} },
    { label: '大号李四', data: { size: 'xl', name: '李四', description: '产品经理' } },
    { label: '无头像', data: { avatarSrc: '', name: '王五', description: '未设置头像' } },
  ],
}
