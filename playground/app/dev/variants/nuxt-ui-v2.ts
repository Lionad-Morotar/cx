import type { VariantRegistry } from '../variants-utils'

// @lionad/cx-comps-nuxt-ui-v2 物料手写 variants：v2 键名无前缀（cx-button / cx-alert …）。
// 只覆盖多形态对照价值高的可视化物料，其余走 variantsOf 默认兜底（v2 无流式 trigger）。

export const nuxtUiV2Variants: VariantRegistry = {
  'cx-button': [
    { label: '实心', data: { variant: 'solid', label: '提交' } },
    { label: '线框', data: { variant: 'outline', label: '取消' } },
    { label: '幽灵圆角', data: { variant: 'ghost', round: true, label: '更多' } },
  ],
  'cx-alert': [
    { label: '实心', data: { variant: 'solid', title: '注意', description: '这是一条实心警告' } },
    { label: '线框', data: { variant: 'outline', title: '提示', description: '线框形态的警告' } },
    { label: '柔和', data: { variant: 'soft', title: '信息', description: '柔和形态的警告' } },
  ],
  'cx-badge': [
    { label: '默认', data: { label: '99' } },
    { label: '另一计数', data: { label: '新' } },
  ],
}
