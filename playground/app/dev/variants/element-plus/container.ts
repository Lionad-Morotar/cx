import type { VariantRegistry } from '../../variants-utils'

// 插槽容器组手写 variants：多区容器与排布工具的对照。
// card 为 region trigger 物料——data 仅阴影枚举，default/header 两区内容经
// buildSampleNode 槽内容路径注入，槽序与 region trigger 声明一致；
// space 以 direction 横/纵与 size 档位形成排布对照。
export const containerVariants: VariantRegistry = {
  'cx-element-plus-card': [
    { label: '始终阴影', data: { shadow: 'always' } },
    { label: '悬停阴影', data: { shadow: 'hover' } },
    { label: '从不阴影', data: { shadow: 'never' } },
  ],
  'cx-element-plus-space': [
    { label: '水平默认间距', data: {} },
    { label: '垂直排布', data: { direction: 'vertical' } },
    { label: '大间距换行', data: { size: 'large', wrap: true } },
  ],
}
