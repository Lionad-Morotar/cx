import type { VariantRegistry } from '../../variants-utils'

// Data Display 分类 variants：article / chart / data-table / stats-display / weather-widget。
// article 为全属性展示样板：组件模板有视觉呈现的 13 个属性（type/content/
// title/description/author/coverImage/tags/rate/createdAt/source/readingTime/
// wordCount/maxHeight/headerPattern）逐组对照；schema 已声明但模板未渲染的
// updatedAt/role/receipt/locale 不放（无视觉差异）。

// 长文折叠样板的正文：八段确保撑出 maxHeight 限高，触发展开/收起交互
const longContent = [
  '## 流式渲染的体感问题',
  '',
  '大段正文在 LLM 流式输出期间，用户面对的是一个长时间空白的卡片。',
  '属性级切分把「完成」的定义从整段 JSON 闭合提前到单个属性闭合：',
  '标题闭合即见标题，标签逐项揭示，正文以骨架示意生长。',
  '',
  '## 截断帧的纯净性',
  '',
  '截断点永远落在闭合事件处，帧内每个值都是完整传输的真实前缀——',
  '不依赖修复器补全半个字符串，也就不会出现一闪而过的错误半值。',
  '',
  '## 骨架与节流',
  '',
  '正文这类长字段以骨架占位而非固定帧出半值；短属性扎堆闭合时按窗口合并出帧。',
  '末尾等不到窗口的属性由围栏闭合后的终态兜底，任何字段都不会丢失。',
  '',
  '> 折叠区之外的内容经展开按钮揭示。',
].join('\n')

export const dataDisplayVariants: VariantRegistry = {
  'cx-vtu-article': [
    {
      // 全要素：header 五项 + 封面 + footer 三项 + 花纹 dots 一次铺满
      label: '完整信息卡 · 花纹 dots',
      data: {
        type: 'md',
        title: 'Schema 驱动的组件渲染',
        description: '从低代码组件定义到运行时渲染的完整链路',
        author: { name: 'Lionad', avatarUrl: 'https://picsum.photos/seed/cx-author/64/64' },
        coverImage: 'https://picsum.photos/seed/cx-article/640/320',
        tags: ['vue', 'low-code', 'streaming'],
        rate: 4.5,
        createdAt: '2026-07-28T09:30:00+08:00',
        source: 'https://github.com/Lionad-Morotar/cx',
        readingTime: 6,
        wordCount: 2380,
        headerPattern: 'dots',
        content:
          '## 概述\n\n物料把工具调用结果渲染为**自包含**组件。\n\n- 属性闭合即切分点\n- 截断帧不经修复器伪造\n\n> 流式期间正文以骨架占位。',
      },
    },
    {
      // type 对照：html 正文经 v-html 直渲
      label: 'HTML 正文',
      data: {
        type: 'html',
        title: '发布说明',
        tags: ['release'],
        content:
          '<p>本版本包含 <strong>流式增量渲染</strong> 与以下改进：</p><ul><li>标量主体形态切分</li><li>正文骨架占位</li></ul>',
      },
    },
    {
      // maxHeight 限高 + expand-button 交互；footer 时长与字数同上呈现
      label: '长文折叠 · maxHeight',
      data: {
        type: 'md',
        title: '流式增量渲染笔记',
        maxHeight: '180px',
        readingTime: 12,
        wordCount: 5120,
        content: longContent,
      },
    },
    {
      // 花纹对照 + 作者无头像（首字母圆形回退）；无封面、无 footer
      label: '花纹 diagonal · 首字母头像',
      data: {
        type: 'md',
        title: '触发器 DSL 设计',
        description: '声明式流式切分的三种形态',
        author: { name: 'Morotar' },
        tags: ['dsl', 'design'],
        headerPattern: 'diagonal',
        content: '数组形态按容器边界切分，区域形态按 slot 揭示，标量主体形态按属性闭合切分。',
      },
    },
    {
      // 契约最小集：仅 type+content；initial 的 title/description/author/
      // tags/readingTime 以 undefined 覆盖，展示无 header/footer 的裸卡片守卫
      label: '极简正文（契约最小集）',
      data: {
        type: 'md',
        title: undefined,
        description: undefined,
        author: undefined,
        tags: undefined,
        readingTime: undefined,
        content: '正文即全部。',
      },
    },
  ],
  'cx-vtu-stats-display': [
    {
      label: '双指标',
      data: {
        title: '概览',
        stats: [
          { key: 'users', label: '用户', value: 1200, format: { kind: 'number' } },
          { key: 'sessions', label: '会话', value: 340, format: { kind: 'number' } },
        ],
      },
    },
    {
      label: '带环比',
      data: {
        title: '营收',
        stats: [
          {
            key: 'revenue',
            label: '营收',
            value: 12800,
            format: { kind: 'currency', currency: 'CNY' },
            diff: { value: 12.5 },
          },
        ],
      },
    },
    {
      // description 副标题 + percent 格式化 + 负值下降环比（红绿方向对照）
      label: '副标题 · 百分比 · 下降环比',
      data: {
        title: '增长健康度',
        description: '环比上个统计周期',
        stats: [
          { key: 'conversion', label: '转化率', value: 0.032, format: { kind: 'percent', decimals: 1 } },
          {
            key: 'retention',
            label: '留存率',
            value: 0.86,
            format: { kind: 'percent' },
            diff: { value: -2.4, label: '较上周' },
          },
        ],
      },
    },
    {
      // sparkline 迷你趋势 + 字符串/布尔值形态（format text 与无 format 直出）
      label: '迷你趋势 · 混合值',
      data: {
        title: '站点状态',
        stats: [
          { key: 'uptime', label: '可用性', value: '99.95%' },
          { key: 'alerts', label: '告警', value: 3, sparkline: { data: [1, 4, 2, 5, 3] } },
          { key: 'maintenance', label: '维护中', value: false },
        ],
      },
    },
  ],
  'cx-vtu-chart': [
    {
      // 双系列对照 + 自定义配色 + 图例网格全开（series.key 与 data 行键一一对应）
      label: '柱状 · 双系列 · 自定义配色',
      data: {
        type: 'bar',
        title: '月度活跃用户',
        xKey: 'month',
        series: [
          { key: 'newUsers', label: '新增' },
          { key: 'returning', label: '回访' },
        ],
        colors: ['#0ea5e9', '#a78bfa'],
        data: [
          { month: '一月', newUsers: 120, returning: 340 },
          { month: '二月', newUsers: 180, returning: 390 },
          { month: '三月', newUsers: 150, returning: 420 },
          { month: '四月', newUsers: 210, returning: 460 },
        ],
        showLegend: true,
        showGrid: true,
      },
    },
    {
      // type 对照：折线 + 单系列 + 图例网格全关（最简坐标系）
      label: '折线 · 无图例网格',
      data: {
        type: 'line',
        title: '响应时延（ms）',
        xKey: 'day',
        series: [{ key: 'p95', label: 'P95' }],
        data: [
          { day: '周一', p95: 220 },
          { day: '周二', p95: 180 },
          { day: '周三', p95: 260 },
          { day: '周四', p95: 190 },
          { day: '周五', p95: 170 },
        ],
        showLegend: false,
        showGrid: false,
      },
    },
  ],
  'cx-vtu-data-table': [
    {
      // 列能力铺满：排序 + 布尔格式化 + 截断 + 右对齐
      label: '自动布局 · 排序与格式化',
      data: {
        columns: [
          { key: 'name', label: '名称', sortable: true },
          { key: 'role', label: '角色', truncate: true },
          { key: 'score', label: '评分', align: 'right', format: { kind: 'number', decimals: 1 } },
          { key: 'active', label: '启用', format: { kind: 'boolean' } },
        ],
        data: [
          { name: 'Alice', role: '管理员', score: 4.5, active: true },
          { name: 'Bob', role: '成员', score: 3.8, active: false },
          { name: 'Carol', role: '审计员', score: 4.9, active: true },
        ],
        layout: 'auto',
      },
    },
    {
      // layout 对照：卡片布局 + 货币/日期格式化
      label: '卡片布局 · 货币与日期',
      data: {
        columns: [
          { key: 'order', label: '订单' },
          { key: 'amount', label: '金额', align: 'right', format: { kind: 'currency', currency: 'CNY' } },
          { key: 'createdAt', label: '创建时间', format: { kind: 'date' } },
        ],
        data: [
          { order: 'A-1001', amount: 12800, createdAt: '2026-07-28' },
          { order: 'A-1002', amount: 3400, createdAt: '2026-07-30' },
        ],
        layout: 'cards',
      },
    },
    {
      // 空态文案定制：data 空数组触发内置 empty 槽
      label: '空态 · 自定义文案',
      data: {
        columns: [
          { key: 'name', label: '名称' },
          { key: 'role', label: '角色' },
        ],
        data: [],
        emptyMessage: '还没有成员，点击右上角邀请',
      },
    },
  ],
  'cx-vtu-weather-widget': [
    {
      // celsius + 降水/能见度全字段 + 四日预报（conditionCode 多样态）
      label: '摄氏 · 全字段实况',
      data: {
        location: { name: '上海' },
        units: { temperature: 'celsius' },
        current: {
          conditionCode: 'rain',
          temperature: 24,
          tempMin: 19,
          tempMax: 27,
          windSpeed: 12,
          precipitationLevel: 'moderate',
          visibility: 8,
        },
        forecast: [
          { label: '周二', conditionCode: 'heavy-rain', tempMin: 18, tempMax: 24 },
          { label: '周三', conditionCode: 'cloudy', tempMin: 17, tempMax: 23 },
          { label: '周四', conditionCode: 'partly-cloudy', tempMin: 18, tempMax: 26 },
          { label: '周五', conditionCode: 'clear', tempMin: 20, tempMax: 29 },
        ],
      },
    },
    {
      // fahrenheit 单位对照 + 雪天态 + 精简两日预报
      label: '华氏 · 雪天',
      data: {
        location: { name: '纽约' },
        units: { temperature: 'fahrenheit' },
        current: { conditionCode: 'snow', temperature: 30, tempMin: 25, tempMax: 33 },
        forecast: [
          { label: 'Tue', conditionCode: 'sleet', tempMin: 26, tempMax: 34 },
          { label: 'Wed', conditionCode: 'windy', tempMin: 28, tempMax: 38 },
        ],
      },
    },
  ],
}
