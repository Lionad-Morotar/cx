import type { VariantRegistry } from '../../variants-utils'

// 表单组手写 variants：对照价值在类型/状态/选中内容（表单件无 trigger，不走回放）。
// date-picker 每组 type 的 valueFormat 与 formattedValue 必须 token 匹配——
// 不匹配时 wrapper 守卫兜底、预览为空（物料 initial 注释同款约定）；month 组
// 格式 'yyyy-MM'，datetime 组 'yyyy-MM-dd HH:mm:ss'。
export const formVariants: VariantRegistry = {
  'cx-naive-ui-input': [
    { label: '默认可清空', data: { value: '流式渲染' } },
    {
      label: '多行文本域',
      data: { type: 'textarea', value: '第一行\n第二行', placeholder: '请输入多行内容' },
    },
    { label: '密码禁用', data: { type: 'password', value: 'secret', disabled: true } },
  ],
  'cx-naive-ui-input-number': [
    { label: '默认', data: { value: 42 } },
    { label: '步长十', data: { value: 50, step: 10 } },
    { label: '禁用', data: { value: 66, disabled: true } },
  ],
  'cx-naive-ui-switch': [
    { label: '默认关', data: {} },
    { label: '开', data: { value: true } },
    { label: '加载中开', data: { value: true, loading: true } },
  ],
  'cx-naive-ui-select': [
    { label: '默认占位', data: {} },
    {
      label: '选中可搜索',
      data: {
        value: 'opt2',
        filterable: true,
        options: [
          { label: '选项一', value: 'opt1' },
          { label: '选项二', value: 'opt2' },
          { label: '选项三', value: 'opt3' },
        ],
      },
    },
    { label: '禁用选中', data: { value: 'opt1', disabled: true } },
  ],
  'cx-naive-ui-radio-group': [
    { label: '默认选甲', data: {} },
    {
      label: '选乙三项',
      data: {
        value: 'b',
        options: [
          { label: '甲', value: 'a' },
          { label: '乙', value: 'b' },
          { label: '丙', value: 'c' },
        ],
      },
    },
    { label: '禁用', data: { disabled: true } },
  ],
  'cx-naive-ui-checkbox-group': [
    { label: '默认选甲', data: {} },
    { label: '全选', data: { value: ['a', 'b'] } },
    { label: '禁用部分选中', data: { value: ['a'], disabled: true } },
  ],
  'cx-naive-ui-date-picker': [
    { label: '默认日期', data: {} },
    {
      label: '日期时间',
      data: {
        type: 'datetime',
        valueFormat: 'yyyy-MM-dd HH:mm:ss',
        formattedValue: '2026-01-01 12:30:00',
      },
    },
    { label: '月份', data: { type: 'month', valueFormat: 'yyyy-MM', formattedValue: '2026-01' } },
  ],
  'cx-naive-ui-rate': [
    { label: '默认三星', data: {} },
    { label: '半选三星半', data: { allowHalf: true, value: 3.5 } },
    { label: '只读十星满分', data: { count: 10, value: 10, readonly: true } },
  ],
  'cx-naive-ui-slider': [
    { label: '默认四十', data: {} },
    { label: '步长二十', data: { value: 60, step: 20 } },
    { label: '禁用', data: { value: 70, disabled: true } },
  ],
}
