import type { VariantRegistry } from '../../variants-utils'

// 基础反馈组手写 variants：button/alert 沿旧单文件 3 组迁入（type 多形态对照价值高），
// result/empty 新增——result 对照价值在 status 状态页语义（成功/404/错误）与尺寸，
// empty 视觉属性仅尺寸与文案，三组走 size 全档。
export const feedbackVariants: VariantRegistry = {
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
  'cx-naive-ui-result': [
    {
      label: '成功',
      data: {
        status: 'success',
        title: '提交成功',
        description: '审核结果将在 1-3 个工作日内通知',
      },
    },
    {
      label: '404',
      data: { status: '404', title: '页面不存在', description: '您访问的页面已被移除或从未存在' },
    },
    {
      label: '错误小尺寸',
      data: {
        status: 'error',
        size: 'small',
        title: '支付失败',
        description: '余额不足，请更换支付方式',
      },
    },
  ],
  'cx-naive-ui-empty': [
    { label: '默认', data: {} },
    { label: '小尺寸自定义', data: { size: 'small', description: '还没有任何消息' } },
    { label: '大尺寸', data: { size: 'large', description: '搜索结果为空' } },
  ],
}
