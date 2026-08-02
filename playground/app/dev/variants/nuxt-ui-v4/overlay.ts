import type { VariantRegistry } from '../../variants-utils'

// Overlay 组裁决不补（全部 8 件走默认单 variant 兜底）。
// 浮层形态依赖交互触发或 teleport，静态验收卡片语境无有效视觉对照，逐件实证：
// modal/slideover 的 open:true 组经 teleport 渲染全屏遮罩 + 浮层，遮蔽验收页；
// popover 的 open 组浮层内容不呈现（hover 模式 open 被忽略），组间无差异；
// tooltip 的 open 组浮层定位错乱（脱离 anchor 跑到视口左上角），遮挡页头；
// context-menu/drawer/dropdown-menu 的 closed 态只渲触发区，items/方向差异不可见；
// toast 为逻辑型物料（UToast 需配合 useToast API 与 UToaster 容器），验收页渲染
// 「无可见 UI」占位，color/icon/duration 差异无任何呈现载体。

export const overlayVariants: VariantRegistry = {}
