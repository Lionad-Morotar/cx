import type { VariantRegistry } from '../variants-utils'

// @lionad/cx-comps-nuxt-ui-v4 物料手写 variants：只覆盖多形态对照价值高的可视化物料，
// 其余 67 件（含 8 件数组增长型 trigger 物料）走 variantsOf 默认兜底。

export const nuxtUiV4Variants: VariantRegistry = {
  'cx-nuxt-ui-v4-button': [
    { label: '实心主要', data: { variant: 'solid', color: 'primary', label: '提交' } },
    { label: '线框成功', data: { variant: 'outline', color: 'success', label: '确认' } },
    { label: '柔和警告', data: { variant: 'soft', color: 'warning', label: '注意' } },
    { label: '加载中', data: { variant: 'solid', color: 'primary', loading: true, label: '处理中' } },
  ],
  'cx-nuxt-ui-v4-alert': [
    { label: '信息实心', data: { color: 'info', variant: 'solid', title: '提示', description: '这是一条信息提示' } },
    { label: '成功柔和', data: { color: 'success', variant: 'soft', title: '成功', description: '操作已完成' } },
    { label: '错误线框', data: { color: 'error', variant: 'outline', title: '错误', description: '请检查输入' } },
  ],
  'cx-nuxt-ui-v4-badge': [
    { label: '实心主要', data: { variant: 'solid', color: 'primary', label: '新' } },
    { label: '柔和中性', data: { variant: 'soft', color: 'neutral', label: '草稿' } },
    { label: '超大尺寸', data: { variant: 'solid', color: 'success', size: 'lg', label: '完成' } },
  ],
}
