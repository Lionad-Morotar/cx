import type { VariantRegistry } from '../../variants-utils'

// 数据展示组手写 variants：avatar 图片地址用 picsum seed 占位（与 vtu 社交件同惯例）；
// badge 对照 value/max/dot/type 四视觉属性；progress 走形态（线/环）× 状态交叉；
// descriptions/collapse 为 array trigger 物料，主数组项形态与其 trigger 声明一致
// （回放剧本真实）；statistic 视觉属性少，对照等宽数字开关与文案。
export const dataVariants: VariantRegistry = {
  'cx-naive-ui-avatar': [
    { label: '圆形图片', data: { src: 'https://picsum.photos/seed/naive-avatar/80' } },
    { label: '方形', data: { round: false, src: 'https://picsum.photos/seed/naive-avatar-sq/80' } },
    { label: '大尺寸空地址', data: { size: 'large' } },
  ],
  'cx-naive-ui-badge': [
    { label: '默认数值', data: { content: '消息', value: '8' } },
    { label: '超最大值', data: { content: '通知', value: '120', max: 99 } },
    { label: '圆点成功', data: { content: '服务', dot: true, type: 'success' } },
  ],
  'cx-naive-ui-progress': [
    { label: '线形默认', data: { percentage: 42 } },
    { label: '环形成功', data: { type: 'circle', status: 'success', percentage: 100 } },
    { label: '线形警告无数值', data: { status: 'warning', percentage: 68, showIndicator: false } },
  ],
  'cx-naive-ui-statistic': [
    { label: '默认', data: {} },
    { label: '非等宽数字', data: { label: '活跃用户', value: '8,921', tabularNums: false } },
    { label: '大数值', data: { label: '总交易额（元）', value: '1,024,768' } },
  ],
  'cx-naive-ui-descriptions': [
    { label: '默认两列带边框', data: {} },
    {
      label: '单列无边框',
      data: {
        column: 1,
        bordered: false,
        title: '订单详情',
        items: [
          { label: '订单号', value: 'CX-20260802-001' },
          { label: '下单时间', value: '2026-08-02 20:15' },
        ],
      },
    },
    {
      label: '三列三项',
      data: {
        column: 3,
        title: '环境信息',
        items: [
          { label: '系统', value: 'macOS' },
          { label: '运行时', value: 'Node 25' },
          { label: '框架', value: 'Nuxt 4' },
        ],
      },
    },
  ],
  'cx-naive-ui-collapse': [
    { label: '默认两面', data: {} },
    {
      label: '手风琴',
      data: {
        accordion: true,
        items: [
          { title: '是什么', content: 'Schema 驱动的组件渲染系统' },
          { title: '怎么用', content: 'LLM 输出 data，物料负责渲染' },
        ],
      },
    },
    {
      label: '三面板',
      data: {
        items: [
          { title: '第一章', content: '流式增量渲染的截断帧落在闭合事件处' },
          { title: '第二章', content: '数组增长型物料逐项揭示' },
          { title: '第三章', content: '标量主体物料属性闭合揭示' },
        ],
      },
    },
  ],
}
