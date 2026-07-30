import type { VariantRegistry } from '../variants-utils'

// @lionad/cx-comps 自研基础物料的手写 variants：只覆盖需要多形态对照的可视化物料，
// 其余 18 件（含 headless 逻辑件）走 variantsOf 的默认兜底，无需在此登记。

export const compsVariants: VariantRegistry = {
  'cx-text': [
    { label: '短文本', data: { content: '这是一段示例文本' } },
    {
      label: '长文本截断',
      data: {
        content:
          '这是一段刻意拉长的文本，用于演示允许截断开启后单行溢出以省略号收口的形态，与短文本形态对照可见截断行为差异',
        truncate: true,
      },
    },
  ],
  'cx-header': [
    { label: '常规标题', data: { content: '章节标题示例' } },
    {
      label: '长标题截断',
      data: {
        content: '这是一段超出容器宽度的长标题，开启截断后以省略号收口',
        truncate: true,
      },
    },
  ],
  'cx-figure': [
    { label: '纯图片', data: { enableCaption: false } },
    {
      label: '带标题',
      data: { enableCaption: true, caption: '图 1 · 插图标题示例' },
    },
  ],
}
