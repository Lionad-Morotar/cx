import type { VariantRegistry } from '../variants-utils'

// @lionad/cx-comps-element-plus 物料手写 variants：覆盖 type/effect 多形态对照价值高的物料，
// 其余（含 table 增量 trigger 物料）走 variantsOf 默认兜底。

export const elementPlusVariants: VariantRegistry = {
  'cx-element-plus-button': [
    { label: '主要', data: { type: 'primary', label: '提交' } },
    { label: '成功朴素', data: { type: 'success', plain: true, label: '通过' } },
    { label: '危险圆角', data: { type: 'danger', round: true, label: '删除' } },
  ],
  'cx-element-plus-alert': [
    { label: '成功浅色', data: { type: 'success', effect: 'light', title: '成功', description: '操作已完成' } },
    { label: '错误深色', data: { type: 'error', effect: 'dark', title: '错误', description: '请检查输入' } },
    { label: '警告浅色', data: { type: 'warning', effect: 'light', title: '警告', description: '请注意' } },
  ],
  'cx-element-plus-tag': [
    { label: '主要浅色', data: { type: 'primary', effect: 'light', label: '标签' } },
    { label: '成功深色', data: { type: 'success', effect: 'dark', label: '完成' } },
    { label: '危险朴素', data: { type: 'danger', effect: 'plain', label: '移除' } },
  ],
}
