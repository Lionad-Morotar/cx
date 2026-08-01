import type { VariantRegistry } from '../../variants-utils'

// Workflow 分类 variants：geo-map / plan / progress-tracker / question-flow / order-summary。
// 目标：让每件物料模板有视觉呈现的属性在组间得到对照展示，状态多样性是重点。

export const workflowVariants: VariantRegistry = {
  'cx-vtu-geo-map': [
    {
      // 默认形态：浅色主题 + 缩放控件 + 多城市标记
      label: '多城市标记 · 浅色主题',
      data: {
        title: '门店分布',
        theme: 'light',
        showZoomControl: true,
        markers: [
          { id: 'sh', lat: 31.23, lng: 121.47, label: '上海' },
          { id: 'bj', lat: 39.9, lng: 116.4, label: '北京' },
          { id: 'gz', lat: 23.13, lng: 113.26, label: '广州' },
          { id: 'cd', lat: 30.57, lng: 104.07, label: '成都' },
        ],
      },
    },
    {
      // 主题对照：深色 + 路线覆盖 + 无缩放控件
      label: '路线覆盖 · 深色主题',
      data: {
        title: '华东线路',
        theme: 'dark',
        showZoomControl: false,
        markers: [
          { id: 'sh', lat: 31.23, lng: 121.47, label: '上海', tooltip: 'always' },
          { id: 'hz', lat: 30.27, lng: 120.15, label: '杭州' },
        ],
        routes: [
          {
            id: 'r1',
            points: [
              { lat: 31.23, lng: 121.47 },
              { lat: 30.27, lng: 120.15 },
            ],
            label: '沪杭线',
            color: '#0ea5e9',
            weight: 4,
          },
        ],
      },
    },
    {
      // 图标与聚类对照：emoji 图标 + 启用聚类
      label: '自定义图标 · 聚类',
      data: {
        title: '区域网点',
        markers: [
          { id: 'sz', lat: 22.54, lng: 114.06, label: '深圳', icon: { type: 'emoji', value: '📍' } },
          { id: 'gz', lat: 23.13, lng: 113.26, label: '广州', icon: { type: 'emoji', value: '📦' } },
          { id: 'dg', lat: 23.05, lng: 113.75, label: '东莞' },
          { id: 'fs', lat: 23.03, lng: 113.12, label: '佛山' },
        ],
        clustering: { enabled: true, radius: 60, minPoints: 2 },
        viewport: { mode: 'fit', target: 'markers', padding: 40 },
      },
    },
    {
      // 视口对照：固定中心点 + 固定缩放
      label: '固定视口 · 无缩放控件',
      data: {
        title: ' centered 视图',
        showZoomControl: false,
        markers: [{ id: 'sh', lat: 31.23, lng: 121.47, label: '上海' }],
        viewport: { mode: 'center', center: { lat: 31.23, lng: 121.47 }, zoom: 10 },
      },
    },
  ],
  'cx-vtu-plan': [
    {
      // 全状态对照：已完成 / 进行中 / 待办 / 已取消 + 默认展开
      label: '全状态待办 · 默认展开',
      data: {
        title: '实施计划',
        description: '分四步完成物料接入，覆盖完整生命周期状态。',
        defaultExpanded: true,
        todos: [
          { id: 't1', label: '搭建包骨架', status: 'completed', description: '已完成基础目录与构建配置。' },
          { id: 't2', label: '接入组件', status: 'in_progress', description: '正在编写 wrapper 与 stream-trigger。' },
          { id: 't3', label: '验收测试', status: 'pending' },
          { id: 't4', label: '废弃草案', status: 'cancelled', description: '早期方案已废弃。' },
        ],
      },
    },
    {
      // 折叠态 + 限显条数，触发"展开更多"交互
      label: '折叠态 · 限显 3 条',
      data: {
        title: '迭代计划',
        defaultExpanded: false,
        maxVisibleTodos: 3,
        todos: [
          { id: 'i1', label: '需求评审', status: 'completed' },
          { id: 'i2', label: '接口设计', status: 'completed' },
          { id: 'i3', label: '前端实现', status: 'in_progress' },
          { id: 'i4', label: '联调', status: 'pending' },
          { id: 'i5', label: '上线', status: 'pending' },
        ],
      },
    },
    {
      // 纯完成态：进度 100% 的视觉反馈
      label: '全部完成',
      data: {
        title: '上线 checklist',
        description: '所有待办已清空。',
        defaultExpanded: true,
        todos: [
          { id: 'c1', label: '环境准备', status: 'completed' },
          { id: 'c2', label: '灰度发布', status: 'completed' },
          { id: 'c3', label: '监控告警', status: 'completed' },
        ],
      },
    },
  ],
  'cx-vtu-progress-tracker': [
    {
      // 标准三态：已完成 / 进行中 / 待办 + 耗时显示
      label: '标准三态 · 已耗时',
      data: {
        elapsedTime: 42000,
        steps: [
          { id: 's1', label: '解析', status: 'completed' },
          { id: 's2', label: '渲染', status: 'in-progress' },
          { id: 's3', label: '校验', status: 'pending' },
        ],
      },
    },
    {
      // 失败分支：进行中与失败步骤展示描述展开态
      label: '失败分支 · 含描述',
      data: {
        elapsedTime: 86500,
        steps: [
          { id: 's1', label: '构建', status: 'completed', description: '产物构建成功。' },
          { id: 's2', label: '部署', status: 'failed', description: '健康检查未通过，端口冲突。' },
          { id: 's3', label: '回滚', status: 'pending' },
        ],
      },
    },
    {
      // 全完成 + 回执：展示成功回执态
      label: '全完成 · 成功回执',
      data: {
        elapsedTime: 128000,
        steps: [
          { id: 's1', label: '采集', status: 'completed' },
          { id: 's2', label: '清洗', status: 'completed' },
          { id: 's3', label: '入库', status: 'completed' },
        ],
        choice: {
          outcome: 'success',
          summary: '数据处理流水线执行完毕',
          at: '2026-08-02T10:30:00+08:00',
        },
      },
    },
  ],
  'cx-vtu-question-flow': [
    {
      // 前置多步骤：单选模式
      label: '前置流程 · 单选',
      data: {
        steps: [
          {
            id: 'q1',
            title: '你偏好哪种渲染方式？',
            selectionMode: 'single',
            options: [
              { id: 'schema', label: 'Schema 驱动' },
              { id: 'hand', label: '手写组件' },
            ],
          },
          {
            id: 'q2',
            title: '是否需要流式输出？',
            selectionMode: 'single',
            options: [
              { id: 'yes', label: '需要' },
              { id: 'no', label: '不需要' },
            ],
          },
        ],
      },
    },
    {
      // 前置多步骤：多选模式 + 禁用项
      label: '前置流程 · 多选',
      data: {
        steps: [
          {
            id: 'q1',
            title: '需要哪些能力？',
            selectionMode: 'multi',
            options: [
              { id: 'a', label: '表格' },
              { id: 'b', label: '图表' },
              { id: 'c', label: '地图', disabled: true },
              { id: 'd', label: '表单' },
            ],
          },
        ],
      },
    },
    {
      // 回执模式：展示选择摘要
      label: '回执模式 · 选择摘要',
      data: {
        choice: {
          title: '配置已确认',
          summary: [
            { label: '渲染方式', value: 'Schema 驱动' },
            { label: '流式输出', value: '需要' },
            { label: '组件范围', value: '表格、图表、表单' },
          ],
        },
      },
    },
    {
      // 渐进模式：单一步骤 + 描述
      label: '渐进模式 · 单步',
      data: {
        step: 1,
        title: '选择主题风格',
        description: '主题将应用于所有预览组件。',
        selectionMode: 'single',
        options: [
          { id: 'light', label: '浅色' },
          { id: 'dark', label: '深色' },
        ],
      },
    },
  ],
  'cx-vtu-order-summary': [
    {
      // 摘要态：多件商品 + 税费
      label: '摘要态 · 多商品',
      data: {
        title: '订单摘要',
        variant: 'summary',
        items: [
          { id: 'p1', name: '专业版', quantity: 1, unitPrice: 99 },
          { id: 'p2', name: '附加席位', quantity: 3, unitPrice: 19 },
        ],
        pricing: { subtotal: 156, tax: 14, total: 170, currency: 'CNY' },
      },
    },
    {
      // 收据态：必须带 choice；展示折扣与运费
      label: '收据态 · 折扣与运费',
      data: {
        title: '支付回执',
        variant: 'receipt',
        items: [
          { id: 'p1', name: '年度订阅', quantity: 1, unitPrice: 299 },
        ],
        pricing: {
          subtotal: 299,
          discount: 30,
          discountLabel: '早鸟优惠',
          shipping: 0,
          tax: 24,
          total: 293,
          currency: 'CNY',
        },
        choice: {
          action: 'confirm',
          orderId: 'ORD-20260802-001',
          confirmedAt: '2026-08-02T10:30:00+08:00',
        },
      },
    },
    {
      // 摘要态最小集：单商品 + 无税费
      label: '摘要态 · 单商品',
      data: {
        title: '购买确认',
        variant: 'summary',
        items: [{ id: 'p1', name: '基础版', quantity: 1, unitPrice: 49 }],
        pricing: { subtotal: 49, total: 49, currency: 'CNY' },
      },
    },
  ],
}
