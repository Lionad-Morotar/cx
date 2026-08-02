import type { VariantRegistry } from '../../variants-utils'

// 导航版式组手写 variants：tag 沿旧单文件 3 组迁入；steps 对照 active/status
// 进程语义；timeline/breadcrumb 为 array trigger 物料，主数组项形态与其
// trigger 声明一致（回放剧本真实）；divider 视觉属性为标题位置与线型，
// vertical 形态受展示卡片高度限制对照价值低，不收录。
export const navigationVariants: VariantRegistry = {
  'cx-naive-ui-tag': [
    { label: '成功', data: { type: 'success', label: '完成' } },
    { label: '警告无边框', data: { type: 'warning', bordered: false, label: '处理中' } },
    { label: '错误圆角', data: { type: 'error', round: true, label: '移除' } },
  ],
  'cx-naive-ui-steps': [
    { label: '默认进行中', data: {} },
    { label: '全部完成', data: { active: 3, status: 'finish' } },
    { label: '第二步错误', data: { active: 2, status: 'error' } },
  ],
  'cx-naive-ui-timeline': [
    { label: '默认两项', data: {} },
    { label: '大尺寸', data: { size: 'large' } },
    {
      label: '三项全类型',
      data: {
        items: [
          { title: '创建任务', content: '任务已创建', time: '2026-07-30', type: 'success' },
          { title: '处理中', content: '正在处理', time: '2026-07-31', type: 'info' },
          { title: '审核驳回', content: '缺少必要材料', time: '2026-08-01', type: 'error' },
        ],
      },
    },
  ],
  'cx-naive-ui-breadcrumb': [
    { label: '默认三项', data: {} },
    { label: '两项', data: { items: [{ title: '首页' }, { title: '组件' }] } },
    {
      label: '四项深层级',
      data: {
        items: [{ title: '首页' }, { title: '文档' }, { title: '组件' }, { title: '面包屑' }],
      },
    },
  ],
  'cx-naive-ui-divider': [
    { label: '默认居中标题', data: {} },
    { label: '左对齐虚线', data: { titlePlacement: 'left', dashed: true, title: '章节' } },
    { label: '右对齐无标题', data: { titlePlacement: 'right', title: '' } },
  ],
}
