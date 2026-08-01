import type { VariantRegistry } from '../../variants-utils'

// Forms & Input 分类 variants：option-list / parameter-slider / preferences-panel。
// 表单物料以 options/sliders/sections 数组为主体（数组增长型 trigger 逐项
// 揭示）；variants 铺满选择模式、约束、禁用态与分区 item 五种类型。

export const formsInputVariants: VariantRegistry = {
  'cx-vtu-option-list': [
    {
      // 单选：含描述、禁用项与预选值（value 为单个 id）
      label: '单选 · 禁用项 · 预选',
      data: {
        selectionMode: 'single',
        options: [
          { id: 'plan-free', label: '免费版', description: '基础功能，无限项目' },
          { id: 'plan-pro', label: '专业版', description: '流式渲染与私有部署' },
          { id: 'plan-enterprise', label: '企业版', description: '暂未到货', disabled: true },
        ],
        value: 'plan-pro',
        maxSelections: 1,
      },
    },
    {
      // 多选：min/max 约束 + 数组预选
      label: '多选 · 数量约束',
      data: {
        selectionMode: 'multi',
        options: [
          { id: 'f-chart', label: '图表' },
          { id: 'f-table', label: '表格' },
          { id: 'f-terminal', label: '终端' },
          { id: 'f-map', label: '地图' },
        ],
        defaultValue: ['f-chart', 'f-table'],
        minSelections: 1,
        maxSelections: 3,
      },
    },
  ],
  'cx-vtu-parameter-slider': [
    {
      // 双滑块：单位与精度对照（整数 °C vs 两位小数）
      label: '双滑块 · 单位与精度',
      data: {
        sliders: [
          { id: 'temp', label: '温度', min: 0, max: 100, step: 1, value: 42, unit: '°C' },
          { id: 'topp', label: 'Top-p', min: 0, max: 1, step: 0.05, value: 0.9, precision: 2 },
        ],
      },
    },
    {
      // 禁用滑块 + 大步进
      label: '禁用态 · 大步进',
      data: {
        sliders: [
          { id: 'batch', label: '批大小', min: 8, max: 512, step: 8, value: 64 },
          { id: 'lr', label: '学习率（锁定）', min: 0, max: 1, step: 0.001, value: 0.003, precision: 3, disabled: true },
        ],
      },
    },
  ],
  'cx-vtu-preferences-panel': [
    {
      // 单分区：switch 与 toggle 两态对照
      label: '开关分区',
      data: {
        title: '通知设置',
        sections: [
          {
            heading: '消息',
            items: [
              { id: 'notif-app', label: '应用内通知', type: 'switch', defaultChecked: true },
              { id: 'notif-mail', label: '邮件摘要', type: 'toggle', defaultChecked: false },
            ],
          },
        ],
      },
    },
    {
      // 多分区铺满 item 五型：select（≥5 选项契约）/input/textarea/switch/toggle
      label: '全类型分区',
      data: {
        title: '偏好设置',
        sections: [
          {
            heading: '外观',
            items: [
              {
                id: 'theme',
                label: '主题',
                type: 'select',
                selectOptions: [
                  { value: 'auto', label: '跟随系统' },
                  { value: 'light', label: '浅色' },
                  { value: 'dark', label: '深色' },
                  { value: 'sepia', label: '纸质' },
                  { value: 'contrast', label: '高对比' },
                ],
                defaultSelected: 'auto',
              },
              { id: 'nickname', label: '昵称', type: 'input', inputType: 'text', placeholder: '展示给协作者', defaultValue: 'Lionad' },
              { id: 'bio', label: '签名', type: 'textarea', rows: 2, placeholder: '一句话介绍' },
            ],
          },
          {
            heading: '隐私',
            items: [
              { id: 'public-profile', label: '公开主页', type: 'switch', defaultChecked: false },
              { id: 'analytics', label: '匿名统计', type: 'toggle', defaultChecked: true },
            ],
          },
        ],
      },
    },
  ],
}
