import type { VariantRegistry } from '../../variants-utils'

// 导航版式组手写 variants：链接/标记/分隔的枚举族与步骤流的路径铺陈对照。
// steps/breadcrumb/timeline 为 array trigger 物料——variant 主数组即回放剧本，
// 数据形态与各 trigger arrayKey 一致（steps=steps、breadcrumb/timeline=items）。
export const navigationVariants: VariantRegistry = {
  'cx-element-plus-link': [
    { label: '主要链接', data: { type: 'primary', label: '查看文档', href: 'https://example.com/docs' } },
    { label: '禁用信息', data: { type: 'info', label: '暂不可达', disabled: true } },
    { label: '危险无下划线', data: { type: 'danger', label: '谨慎操作', underline: false } },
  ],
  'cx-element-plus-tag': [
    { label: '主要浅色', data: { type: 'primary', effect: 'light', label: '标签' } },
    { label: '成功深色', data: { type: 'success', effect: 'dark', label: '完成' } },
    { label: '危险朴素', data: { type: 'danger', effect: 'plain', label: '移除' } },
  ],
  'cx-element-plus-divider': [
    { label: '水平中文本', data: { label: '分割线' } },
    { label: '垂直', data: { direction: 'vertical' } },
    { label: '右侧文本', data: { label: '更多', contentPosition: 'right' } },
  ],
  'cx-element-plus-steps': [
    {
      label: '水平第二步',
      data: {
        active: 1,
        steps: [{ title: '提交订单' }, { title: '支付' }, { title: '发货' }],
      },
    },
    // 步骤状态混合并存：wait/process/finish/error 四态同屏对照
    {
      label: '状态混合',
      data: {
        active: 2,
        steps: [
          { title: '提交订单', status: 'finish' },
          { title: '支付', status: 'finish' },
          { title: '发货', status: 'error', description: '库存不足' },
          { title: '签收', status: 'wait' },
        ],
      },
    },
    {
      label: '垂直步骤',
      data: {
        direction: 'vertical',
        active: 0,
        steps: [
          { title: '创建任务', description: '填写基本信息' },
          { title: '分配成员', description: '选择负责人' },
        ],
      },
    },
  ],
  'cx-element-plus-breadcrumb': [
    { label: '默认三级', data: { items: [{ label: '首页' }, { label: '列表' }, { label: '详情' }] } },
    {
      label: '箭头分隔',
      data: { separator: '>', items: [{ label: '物料中心' }, { label: 'Element Plus' }, { label: '表格' }] },
    },
  ],
  'cx-element-plus-timeline': [
    {
      label: '默认事件',
      data: {
        items: [
          { content: '创建任务', timestamp: '2026-07-30 10:00' },
          { content: '完成任务', timestamp: '2026-07-31 18:00' },
        ],
      },
    },
    // type/color 视觉差异：语义色与自定义色并存的节点对照
    {
      label: '多彩节点',
      data: {
        items: [
          { content: '项目启动', timestamp: '2026-07-01 09:00', type: 'primary' },
          { content: '首次发布', timestamp: '2026-07-15 14:00', type: 'success' },
          { content: '线上告警', timestamp: '2026-07-20 03:00', type: 'danger' },
          { content: '周年庆', timestamp: '2026-08-01 00:00', color: '#8e44ad' },
        ],
      },
    },
  ],
}
