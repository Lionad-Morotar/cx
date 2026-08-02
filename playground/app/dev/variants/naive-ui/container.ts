import type { VariantRegistry } from '../../variants-utils'

// 插槽容器组手写 variants：variants 只表达 props 对照，槽内容由 buildSampleNode
// 自动注入 default 槽示例（card 为 region trigger 物料，default/header 双槽剧本
// 与 region 声明同源）；space 对照排列方向/对齐/间距。
export const containerVariants: VariantRegistry = {
  'cx-naive-ui-card': [
    { label: '默认线框', data: {} },
    { label: '小尺寸悬停浮起', data: { size: 'small', hoverable: true } },
    { label: '无边框大尺寸', data: { bordered: false, size: 'large' } },
  ],
  'cx-naive-ui-space': [
    { label: '默认水平居中', data: {} },
    { label: '垂直排列', data: { vertical: true } },
    { label: '大间距拉伸', data: { size: 'large', align: 'stretch' } },
  ],
}
