import type { VariantRegistry } from '../variants-utils'

// @lionad/cx-comps 自研基础物料的手写 variants：只覆盖需要多形态对照的可视化物料，
// 其余（headless 逻辑件、无 props 容器、calendar）走 variantsOf 的默认兜底，无需登记。
// 流式回放即以此登记为剧本（registry.has 门控 + 本表 data 覆盖 = 回放数据源）。
//
// 裁决留痕（实证后裁决不登记）：
// - cx-grid：空网格槽位（row-N-col-M 命名槽）无内容无尺寸，colCount/rowCount 变体
//   渲染均不可见，无视觉对照价值（页面实证：预览区完全空白）
// - cx-block / cx-scrollbar / cx-page：props 为空，无可对照属性

// 长文本须真实溢出宽预览容器才让省略号截断可见：text 的 13~14px 字号下
// 每字宽与字号同，全文约 150 字经 scrollWidth > clientWidth 实证在
// ~1900px 宽容器稳定溢出；h1 的 24px 字号溢出更充分。不足百字的
// 「长文本」在宽容器不截断，truncate 对照会名不副实。
const LONG_TITLE =
  '这是一段刻意拉长的长标题示例文本，用于演示允许截断开启后单行溢出并以省略号收口的形态——即使容器本身较宽，这段文字也会超出可视宽度范围，从而与常规形态对照时可以清楚看见截断行为的差异；若仍不够长，继续补充说明文字直至稳定溢出容器边界，确保省略号真实出现在预览区域之中，不再依赖任何视口宽度的巧合'

/** 标题家族 variants 工厂：h1~h5 同构（content/truncate 属性对），仅层级语义不同 */
const headingVariants = (name: string) => [
  { label: '常规标题', data: { content: `${name}示例` } },
  { label: '长标题截断', data: { content: LONG_TITLE, truncate: true } },
]

export const compsVariants: VariantRegistry = {
  'cx-text': [
    { label: '短文本', data: { content: '这是一段示例文本' } },
    { label: '长文本截断', data: { content: LONG_TITLE, truncate: true } },
  ],
  'cx-header': [
    { label: '常规标题', data: { content: '章节标题示例' } },
    {
      label: '长标题截断',
      data: { content: LONG_TITLE, truncate: true },
    },
  ],
  'cx-h1': headingVariants('一级标题'),
  'cx-h2': headingVariants('二级标题'),
  'cx-h3': headingVariants('三级标题'),
  'cx-h4': headingVariants('四级标题'),
  'cx-h5': headingVariants('五级标题'),
  'cx-user-style': [
    { label: '空样式', data: {} },
    {
      label: '文本染色',
      data: { userStyle: '.cx-text { color: #e0245e; font-weight: 600 }' },
    },
  ],
  'cx-figure': [
    {
      label: '纯图片',
      data: { image: { url: 'https://picsum.photos/seed/cx-figure/640/640' } },
    },
    {
      label: '带标题',
      data: {
        image: { url: 'https://picsum.photos/seed/cx-figure-caption/640/640' },
        enableCaption: true,
        caption: '图 1 · 插图标题示例',
      },
    },
  ],
}
