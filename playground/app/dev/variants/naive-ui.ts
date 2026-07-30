import type { VariantRegistry } from '../variants-utils'

// @lionad/cx-comps-naive-ui 物料手写 variants：覆盖 type/形态多形态对照价值高的物料，
// 其余（含 data-table 增量 trigger 物料）走 variantsOf 默认兜底。

export const naiveUiVariants: VariantRegistry = {
  'cx-naive-ui-button': [
    { label: '主要', data: { type: 'primary', label: '提交' } },
    { label: '信息虚线', data: { type: 'info', dashed: true, label: '详情' } },
    { label: '错误小尺寸', data: { type: 'error', size: 'small', label: '删除' } },
  ],
  'cx-naive-ui-alert': [
    { label: '成功', data: { type: 'success', title: '成功', content: '操作已完成' } },
    { label: '警告', data: { type: 'warning', title: '警告', content: '请确认后再试' } },
    { label: '错误', data: { type: 'error', title: '错误', content: '操作失败' } },
  ],
  'cx-naive-ui-tag': [
    { label: '成功', data: { type: 'success', label: '完成' } },
    { label: '警告无边框', data: { type: 'warning', bordered: false, label: '处理中' } },
    { label: '错误圆角', data: { type: 'error', round: true, label: '移除' } },
  ],
}
