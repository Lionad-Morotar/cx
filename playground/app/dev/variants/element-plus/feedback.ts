import type { VariantRegistry } from '../../variants-utils'

// 基础反馈组手写 variants：动作与反馈态的枚举族对照（type/effect 二维）。
// alert/result/empty 为 scalar trigger 物料——variant 即回放剧本，
// 主体字段（title/description/subTitle）覆盖有/无对照，验证空壳挂载后的属性揭示。
export const feedbackVariants: VariantRegistry = {
  'cx-element-plus-button': [
    { label: '主要', data: { type: 'primary', label: '提交' } },
    { label: '成功朴素', data: { type: 'success', plain: true, label: '通过' } },
    { label: '危险圆角', data: { type: 'danger', round: true, label: '删除' } },
  ],
  'cx-element-plus-alert': [
    { label: '成功浅色', data: { type: 'success', effect: 'light', title: '成功', description: '操作已完成' } },
    { label: '错误深色', data: { type: 'error', effect: 'dark', title: '错误', description: '请检查输入' } },
    { label: '警告浅色', data: { type: 'warning', effect: 'light', title: '警告', description: '请注意' } },
    // 无描述组：主体字段有/无对照，回放覆盖 title-only 短剧本形态
    { label: '仅标题', data: { type: 'info', title: '系统通知' } },
  ],
  'cx-element-plus-result': [
    { label: '成功带副标题', data: { icon: 'success', title: '支付成功', subTitle: '订单号 20260802' } },
    { label: '错误无副标题', data: { icon: 'error', title: '支付失败' } },
    { label: '信息提示', data: { icon: 'info', title: '待审核', subTitle: '请在 24 小时内处理' } },
  ],
  'cx-element-plus-empty': [
    { label: '默认描述', data: {} },
    { label: '自定义文案', data: { description: '当前筛选条件下没有匹配的记录' } },
  ],
}
