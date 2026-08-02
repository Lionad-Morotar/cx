import type { VariantRegistry } from '../../variants-utils'

// 数据展示组手写 variants：形态属性（shape/size/type/列数/精度）的视觉对照。
// descriptions 为 array trigger 物料——variant 主数组（items）即回放剧本，
// 数据形态与 trigger arrayKey 一致；avatar 为 scalar trigger 物料（src/alt 主体字段）。
export const dataVariants: VariantRegistry = {
  'cx-element-plus-avatar': [
    // 空 src 触发 ElAvatar fallback 图标分支，与图片态形成可观察对照
    { label: '默认占位', data: {} },
    { label: '方形大号', data: { shape: 'square', size: 'large' } },
    { label: '图片头像', data: { src: 'https://i.pravatar.cc/64?u=cx', alt: '用户头像' } },
  ],
  'cx-element-plus-badge': [
    { label: '默认值', data: { content: '消息中心', value: 3 } },
    { label: '超出最大值', data: { content: '未读通知', value: 120, max: 99 } },
    { label: '主要小圆点', data: { content: '系统公告', isDot: true, type: 'primary' } },
  ],
  'cx-element-plus-progress': [
    { label: '线形六成', data: { percentage: 60 } },
    { label: '圆形成功', data: { type: 'circle', percentage: 100, status: 'success' } },
    { label: '仪表盘异常', data: { type: 'dashboard', percentage: 30, status: 'exception' } },
  ],
  'cx-element-plus-statistic': [
    { label: '默认指标', data: { title: '活跃用户', value: 1024 } },
    { label: '金额精度', data: { title: '交易额', value: 9527.5, precision: 2, prefix: '¥' } },
    { label: '后缀百分比', data: { title: '完成率', value: 86, suffix: '%' } },
  ],
  'cx-element-plus-descriptions': [
    {
      label: '默认三项',
      data: {
        title: '用户信息',
        items: [
          { label: '姓名', value: 'Alice' },
          { label: '角色', value: '管理员' },
          { label: '部门', value: '平台组' },
        ],
      },
    },
    {
      label: '带边框两列',
      data: {
        title: '部署详情',
        border: true,
        column: 2,
        items: [
          { label: '版本', value: 'v2.4.0' },
          { label: '环境', value: '生产' },
          { label: '耗时', value: '3 分钟' },
          { label: '操作人', value: '仿生狮子' },
        ],
      },
    },
  ],
}
