import type { VariantRegistry } from '../../variants-utils'

// 表单组手写 variants：9 件控件的 disabled/clearable/占位/选项形态对照。
// 控件选项数组（select/radio-group/checkbox-group 的 options）是展示数据，
// 与「表单控件选项不进 trigger」的流式判定兼容——不改变判定，仅作视觉对照。
export const formVariants: VariantRegistry = {
  'cx-element-plus-input': [
    { label: '默认可清空', data: { placeholder: '请输入关键词', clearable: true } },
    { label: '禁用态', data: { placeholder: '不可编辑', disabled: true } },
    { label: '多行限长', data: { type: 'textarea', maxlength: 50, placeholder: '最多 50 字' } },
  ],
  'cx-element-plus-input-number': [
    { label: '默认步长', data: { min: 0, max: 100 } },
    { label: '半步精度', data: { step: 0.5, precision: 1, min: 0, max: 10 } },
    { label: '禁用态', data: { disabled: true } },
  ],
  'cx-element-plus-select': [
    {
      label: '默认两项',
      data: {
        placeholder: '请选择',
        options: [
          { label: '选项一', value: 'a' },
          { label: '选项二', value: 'b' },
        ],
      },
    },
    {
      label: '可清空多项',
      data: {
        placeholder: '选择环境',
        clearable: true,
        options: [
          { label: '开发', value: 'dev' },
          { label: '测试', value: 'staging' },
          { label: '生产', value: 'prod' },
        ],
      },
    },
    { label: '禁用态', data: { disabled: true, placeholder: '不可选择' } },
  ],
  'cx-element-plus-radio-group': [
    {
      label: '默认两项',
      data: {
        options: [
          { label: '选项一', value: 'a' },
          { label: '选项二', value: 'b' },
        ],
      },
    },
    {
      label: '禁用三项',
      data: {
        disabled: true,
        options: [
          { label: '低', value: 'low' },
          { label: '中', value: 'mid' },
          { label: '高', value: 'high' },
        ],
      },
    },
  ],
  'cx-element-plus-checkbox-group': [
    {
      label: '默认两项',
      data: {
        options: [
          { label: '选项一', value: 'a' },
          { label: '选项二', value: 'b' },
        ],
      },
    },
    {
      label: '禁用态',
      data: {
        disabled: true,
        options: [
          { label: '邮件通知', value: 'mail' },
          { label: '短信通知', value: 'sms' },
        ],
      },
    },
  ],
  'cx-element-plus-switch': [
    { label: '默认开关', data: {} },
    { label: '带文案', data: { activeText: '启用', inactiveText: '停用' } },
    { label: '禁用态', data: { disabled: true } },
  ],
  'cx-element-plus-date-picker': [
    { label: '按日选择', data: { placeholder: '选择日期' } },
    { label: '日期时间', data: { type: 'datetime', placeholder: '选择日期时间' } },
    { label: '按月禁用', data: { type: 'month', disabled: true, placeholder: '不可选择' } },
  ],
  'cx-element-plus-rate': [
    { label: '默认五星', data: {} },
    { label: '允许半选', data: { allowHalf: true, max: 6 } },
    { label: '只读展示', data: { disabled: true } },
  ],
  'cx-element-plus-slider': [
    { label: '默认滑杆', data: {} },
    { label: '十步长', data: { step: 10, min: 0, max: 100 } },
    { label: '禁用态', data: { disabled: true } },
  ],
}
