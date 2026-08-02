import type { VariantRegistry } from '../../variants-utils'

// Form 组手写 variants：表单控件的静态可呈现形态（枚举族/禁用/校验态）。
// 裁决不补 1 件（默认单 variant 兜底）：form 无任何 props、组间无视觉差异。

export const formVariants: VariantRegistry = {
  'cx-nuxt-ui-v4-checkbox': [
    { label: '默认主要', data: {} },
    { label: '成功色', data: { color: 'success', label: '已完成' } },
    { label: '禁用态', data: { disabled: true, label: '不可选' } },
  ],
  'cx-nuxt-ui-v4-checkbox-group': [
    { label: '默认纵向列表', data: {} },
    { label: '卡片横向', data: { variant: 'card', orientation: 'horizontal', legend: '选择功能' } },
    { label: '自定义选项', data: { items: ['苹果', '香蕉', '橘子'], legend: '水果' } },
  ],
  'cx-nuxt-ui-v4-color-picker': [
    { label: '默认绿色', data: {} },
    { label: '大号 RGB', data: { format: 'rgb', size: 'lg', value: '#3B82F6' } },
    { label: '禁用态', data: { disabled: true } },
  ],
  'cx-nuxt-ui-v4-file-upload': [
    { label: '默认拖拽区', data: {} },
    { label: '按钮形态', data: { variant: 'button', label: '上传附件' } },
    { label: '多文件警告色', data: { multiple: true, color: 'warning', label: '上传多个文件' } },
  ],
  'cx-nuxt-ui-v4-form-field': [
    { label: '默认标签', data: {} },
    { label: '必填带提示', data: { required: true, hint: '最多 20 字', label: '用户名' } },
    { label: '校验错误', data: { error: '该字段不能为空', label: '邮箱' } },
  ],
  'cx-nuxt-ui-v4-input': [
    { label: '默认线框', data: {} },
    { label: '柔和带图标', data: { variant: 'soft', icon: 'i-lucide-search', placeholder: '搜索…' } },
    { label: '禁用密码框', data: { type: 'password', disabled: true } },
  ],
  'cx-nuxt-ui-v4-input-date': [
    { label: '默认日期', data: {} },
    { label: '大号成功', data: { size: 'lg', color: 'success', value: '2026-08-02' } },
  ],
  'cx-nuxt-ui-v4-input-menu': [
    { label: '默认输入选择', data: {} },
    { label: '大号成功', data: { size: 'lg', color: 'success' } },
  ],
  'cx-nuxt-ui-v4-input-number': [
    { label: '默认水平', data: {} },
    { label: '垂直步进五', data: { orientation: 'vertical', step: 5, value: 25 } },
    { label: '禁用态', data: { disabled: true } },
  ],
  'cx-nuxt-ui-v4-input-rating': [
    { label: '默认三星', data: {} },
    { label: '满心形', data: { icon: 'i-lucide-heart', color: 'error', value: 5 } },
    { label: '半星十级', data: { length: 10, step: 0.5, value: 4.5 } },
  ],
  'cx-nuxt-ui-v4-input-tags': [
    { label: '默认标签', data: {} },
    { label: '自定义标签', data: { tags: ['前端', 'Vue', 'TS'], icon: 'i-lucide-tag' } },
    { label: '成功色', data: { color: 'success' } },
  ],
  'cx-nuxt-ui-v4-input-time': [
    { label: '默认 24 小时制', data: {} },
    { label: '十二小时制', data: { hourCycle: 12, color: 'info' } },
  ],
  'cx-nuxt-ui-v4-listbox': [
    { label: '默认单选', data: {} },
    { label: '多选成功色', data: { multiple: true, color: 'success' } },
  ],
  'cx-nuxt-ui-v4-pin-input': [
    { label: '默认六位', data: {} },
    { label: '四位数字掩码', data: { length: 4, type: 'number', mask: true, otp: true } },
    { label: '三分隔', data: { separator: 3 } },
  ],
  'cx-nuxt-ui-v4-radio-group': [
    { label: '默认纵向', data: {} },
    { label: '横向成功色', data: { orientation: 'horizontal', color: 'success' } },
  ],
  'cx-nuxt-ui-v4-select': [
    { label: '默认线框', data: {} },
    { label: '柔和大号', data: { variant: 'soft', size: 'lg' } },
    { label: '禁用态', data: { disabled: true } },
  ],
  'cx-nuxt-ui-v4-select-menu': [
    { label: '默认选择菜单', data: {} },
    { label: '多选大号', data: { multiple: true, size: 'lg' } },
    { label: '信息色', data: { color: 'info' } },
  ],
  'cx-nuxt-ui-v4-slider': [
    { label: '默认一半', data: {} },
    { label: '警告八十', data: { value: 80, color: 'warning' } },
    { label: '步进十', data: { step: 10, value: 30, color: 'success' } },
  ],
  'cx-nuxt-ui-v4-switch': [
    { label: '默认主要', data: {} },
    { label: '成功色', data: { color: 'success', label: '自动保存' } },
    { label: '禁用态', data: { disabled: true } },
  ],
  'cx-nuxt-ui-v4-textarea': [
    { label: '默认三行', data: {} },
    { label: '自适应柔和', data: { autoresize: true, variant: 'soft', placeholder: '内容自动增高…' } },
    { label: '禁用五行', data: { disabled: true, rows: 5 } },
  ],
}
