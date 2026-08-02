import type { VariantRegistry } from '../../variants-utils'

// Element 组手写 variants：基础视觉元素的枚举族对照（color/variant/size 三维）。
// 组内 16 件全手写；calendar 为日期选择控件，月份/周数形态有视觉呈现。

export const elementVariants: VariantRegistry = {
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
    { label: '次级中性', data: { color: 'neutral', variant: 'subtle', title: '次要提示', description: 'subtle 样式中性色' } },
  ],
  'cx-nuxt-ui-v4-badge': [
    { label: '实心主要', data: { variant: 'solid', color: 'primary', label: '新' } },
    { label: '柔和中性', data: { variant: 'soft', color: 'neutral', label: '草稿' } },
    { label: '超大尺寸', data: { variant: 'solid', color: 'success', size: 'lg', label: '完成' } },
  ],
  'cx-nuxt-ui-v4-avatar': [
    { label: '默认图片头像', data: {} },
    { label: '大号图片', data: { size: 'xl' } },
    // src 置空串触发 Nuxt UI 的 text 回退分支，与图片态形成可观察对照
    { label: '文字头像', data: { src: '', text: '狮' } },
  ],
  'cx-nuxt-ui-v4-avatar-group': [
    { label: '默认最多三个', data: {} },
    { label: '大号两个', data: { max: 2, size: 'xl' } },
    { label: '成功色', data: { color: 'success' } },
  ],
  'cx-nuxt-ui-v4-banner': [
    { label: '默认公告', data: {} },
    { label: '警告色', data: { color: 'warning', title: '系统维护通知' } },
    { label: '可关闭', data: { close: true, title: '这条公告可以关闭' } },
  ],
  'cx-nuxt-ui-v4-calendar': [
    { label: '默认单月日期', data: {} },
    { label: '双月并排', data: { numberOfMonths: 2 } },
    { label: '月份选择', data: { type: 'month' } },
    { label: '范围选择', data: { range: true } },
  ],
  'cx-nuxt-ui-v4-card': [
    { label: '默认线框', data: {} },
    { label: '柔和', data: { variant: 'soft', title: '柔和卡片', description: 'soft 样式' } },
    { label: '次级', data: { variant: 'subtle', title: '次级卡片', description: 'subtle 样式' } },
  ],
  'cx-nuxt-ui-v4-chip': [
    { label: '默认右上', data: {} },
    { label: '左下成功', data: { position: 'bottom-left', color: 'success', text: 'HOT' } },
    { label: '大号警告', data: { size: 'xl', color: 'warning', text: '99+' } },
  ],
  'cx-nuxt-ui-v4-collapsible': [
    { label: '默认展开', data: {} },
    { label: '默认收起', data: { open: false } },
  ],
  'cx-nuxt-ui-v4-field-group': [
    { label: '默认横向', data: {} },
    { label: '纵向', data: { orientation: 'vertical' } },
    { label: '大号', data: { size: 'xl' } },
  ],
  'cx-nuxt-ui-v4-icon': [
    { label: '默认对勾', data: {} },
    { label: '大尺寸警告', data: { name: 'i-lucide-alert-triangle', size: '48px' } },
    { label: '星标', data: { name: 'i-lucide-star', size: '32px' } },
  ],
  'cx-nuxt-ui-v4-kbd': [
    { label: '默认线框', data: {} },
    { label: '实心成功', data: { variant: 'solid', color: 'success', value: 'Enter' } },
    { label: '大号柔和', data: { variant: 'soft', size: 'xl', value: 'Esc' } },
  ],
  'cx-nuxt-ui-v4-progress': [
    { label: '默认一半', data: {} },
    { label: '成功八十', data: { value: 80, color: 'success' } },
    { label: '大号警告', data: { value: 25, size: 'xl', color: 'warning' } },
  ],
  'cx-nuxt-ui-v4-separator': [
    { label: '默认横向实线', data: {} },
    { label: '虚线警告', data: { type: 'dashed', color: 'warning' } },
    { label: '点线带标签', data: { type: 'dotted', label: '或' } },
  ],
  'cx-nuxt-ui-v4-skeleton': [
    { label: '默认条形', data: {} },
    { label: '方形头像', data: { width: '48px', height: '48px' } },
    { label: '长文本行', data: { width: '240px', height: '16px' } },
  ],
}
