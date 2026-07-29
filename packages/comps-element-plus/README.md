# @lionad/cx-comps-element-plus

cx 物料包：把 [Element Plus](https://element-plus.org/) 组件包装为 schema 驱动的 cx 物料，形态对齐 `@lionad/cx-comps-vtu`（外部纯 npm 库包装范式：不 vendor、不 shim，物料包装层 `inheritAttrs:false` + `useAttrs` + `useEpProps` 桥接 + `v-bind` 透传）。

## 装配

### 1. 启用物料集

宿主在 `@lionad/cx-nuxt` 模块选项中启用 `element-plus`：

```ts
export default defineNuxtConfig({
  modules: [['@lionad/cx-nuxt', { materials: ['render', 'components', 'element-plus'] }]],
})
```

模块据此把 `@lionad/cx-comps-element-plus` 的 `CxElementPlusBundle` 写入虚拟模块 `#build/cx-bundles.mjs`（真 opt-in：未启用则不解析该包）。

### 2. 宿主入口 css 注入样式（必读，层序契约）

cx-nuxt **不在模块侧注入** Element Plus 样式（与 vtu 同哲学，交还宿主负责）。原因：EP 全量 css 含全局元素 reset（`button { background-color: transparent }` 等）且为 **unlayered**，按 CSS 级联规则会胜过宿主的 `@layer utilities`，把 nuxt-ui / tailwind 的按钮、输入框等背景重置为透明。

正确做法：在宿主入口 css 中把 EP css 压入层序最前的 `cx-ep` 层。层序声明必须早于 `@import 'tailwindcss'`（其展开的 `theme/base/components/utilities` 层序），`cx-ep` 方能排在 `utilities` 之前、使元素 reset 输给宿主工具类；EP 自身的 `.el-*` 类选择器因所在元素无宿主工具类竞争，仍正常生效：

```css
@layer cx-ep, theme, base, components, utilities;
@import 'tailwindcss';
/* 其余宿主 import … */
@import 'element-plus/dist/index.css' layer(cx-ep);
```

> 若宿主不使用 tailwind / 无 `@layer utilities`，EP 的 unlayered reset 无竞争对象，可直接 `@import 'element-plus/dist/index.css'` 而不分层——分层仅在「EP 与 tailwind 工具类共存」时为必需。

## 物料清单（六类 27 件，冻结）

| 类别 | 物料 key |
|---|---|
| 基础反馈 | `cx-element-plus-button` `cx-element-plus-alert` `cx-element-plus-result` `cx-element-plus-empty` |
| 数据展示 | `cx-element-plus-avatar` `cx-element-plus-badge` `cx-element-plus-progress` `cx-element-plus-statistic` `cx-element-plus-descriptions` |
| 导航版式 | `cx-element-plus-link` `cx-element-plus-tag` `cx-element-plus-divider` `cx-element-plus-steps` `cx-element-plus-breadcrumb` `cx-element-plus-timeline` |
| 表单 | `cx-element-plus-input` `cx-element-plus-input-number` `cx-element-plus-select` `cx-element-plus-radio-group` `cx-element-plus-checkbox-group` `cx-element-plus-switch` `cx-element-plus-date-picker` `cx-element-plus-rate` `cx-element-plus-slider` |
| 表格 | `cx-element-plus-table` |
| 插槽容器 | `cx-element-plus-card` `cx-element-plus-space` |

## 值与事件模型

- **值下行**：`modelValue` 等经 cx `data` 灌入 attrs，桥接原样透传到 EP 控件（如 input 的 DOM value、switch 的选中态）。
- **变更上行**：物料**不声明 emits meta**，走原生事件通道——渲染器把 `_cx_events ∩ nativeEvents`（`input`/`change`/`blur` 等）编译为监听器随 attrs 灌入，经 `v-bind` 绑定到 EP 组件后被其 emit 触发。故 schema 配置 `_cx_events` 即可路由变更，无需 emits 元信息。
- **选项驱动**：`select`/`radio-group`/`checkbox-group`/`descriptions`/`steps`/`breadcrumb`/`timeline`/`table` 的子项由 JSON 数组（`options`/`items`/`columns`/`steps`/`data`）经包装层 `v-for` 展开为 EP 子组件。

## 插槽

`cx-element-plus-card` 的 slots meta 以对象形态同时声明 `default` 与 `header`——渲染器对对象形态 `mapValues` 只产出显式声明的键，漏声明 `default` 会使默认插槽子物料永不渲染。`space` 仅 `default` 插槽。

## 流式增量预设

`createEpTriggerRegistry()` / `mainArrayOf()` / `EP_STREAM_TRIGGERS` 导出，供 playground 卡片回放等流式场景装配。初始仅 `cx-element-plus-table` 收录（行数据为典型增长数组；`extraScanPaths` 含列定义次增长路径，与 vtu data-table 同形）。`descriptions`/`steps` 等的数组 props 为编辑器静态配置而非流式增长主体，不收录。

## 未收录

overlay 与服务类（`dialog`/`drawer`/`popover`/`message`/`message-box`/`notification`）——teleport 内容与命令式 API 不在 cx 事件路由范式内；`form`/`form-item` 校验容器、`tree`/`upload` 等重组件延后。
