# @lionad/cx-comps-naive-ui

把 [Naive UI](https://www.naiveui.com/) 组件包装为 cx schema 驱动物料。六类 27 件冻结（基础反馈 / 数据展示 / 导航版式 / 表单 / 表格 / 插槽容器），对齐 `@lionad/cx-comps-element-plus` 的纯 npm 库包装范式。

## 装配

经 `@lionad/cx-nuxt` 的 `materials` 选项 opt-in：

```ts
export default defineNuxtConfig({
  modules: [
    ['@lionad/cx-nuxt', { materials: ['render', 'components', 'naive-ui'] }],
  ],
})
```

宿主另需在 `dependencies` 声明 `naive-ui`（lock 一致 + optimizeDeps 解析）。

## 样式契约：零 css 装配

naive-ui 为 CSS-in-JS（css-render 于组件渲染期注入 `<style>` 标签，引用计数随组件卸载移除）：

- 无 dist css 文件，cx-nuxt 模块侧与宿主入口 css 均**无需任何注入**
- 不参与 `@layer` 层序安排（区别于 element-plus 的 `layer(cx-ep)` 宿主契约）
- 样式全部作用于 `n-*` 前缀类选择器与 inline CSS 变量，无全局元素 reset，宿主外观零侵扰

## 事件通道

naive-ui 双向约定为 `value` + `update:value`（非 `modelValue`），配置键直接取 naive prop 名。变更上行不声明 emits meta（全仓先例 + defineCxComponent emits Guard），分三族：

- **透传族**（input / input-number / select）：naive 声明并内部调用 `onChange` 函数型 prop，v-bind 直达
- **桥接族**（switch / radio-group / checkbox-group / rate / slider）：`useNaiveChangeBridge` 剥离 `onChange`/`onInput`（防废弃 prop 双发与死监听器）后经 `@update:value → attrs.onChange` 桥接
- **formatted-value 桥接族**（date-picker）：`@update:formatted-value → attrs.onChange`，载荷为格式化字符串（`valueFormat` 默认 `yyyy-MM-dd`，date-fns token，小写 yyyy）；包装层守卫非法 `formattedValue`（date-fns 解析抛 RangeError 会致整棵子树为空），非法值回退空态

## 组件清单（27 件）

| 分类 | 物料 |
| --- | --- |
| 基础反馈（4） | button、alert、result、empty |
| 数据展示（6） | avatar、badge、progress、statistic、descriptions、collapse |
| 导航版式（5） | tag、divider、steps、breadcrumb、timeline |
| 表单（9） | input、input-number、switch、select、radio-group、checkbox-group、date-picker、rate、slider |
| 表格（1） | data-table（columns `label→title` 映射、流式增量 trigger） |
| 插槽容器（2） | card（default + header 双插槽）、space |

## 未收录与理由

- **overlay 与服务类**（modal / drawer / popconfirm / popover / tooltip / message / notification）：teleport 与 provider 服务式 API 的 cx 事件路由未取证
- **form 校验容器**（n-form / n-form-item）：校验链路与低代码事件链整合未设计
- **重组件**（tree / upload / cascader / transfer / color-picker / mention / dynamic-*）：配置面过大，留待按需增补（增补须同步解冻 27 件契约断言、playground 分类清单与本文档）
- **link**：naive 无独立链接组件（NA 锚点语义弱，NButton text 模式可覆盖链接外观）
- **SSR 样式提取**：css-render 单实例约束，playground `ssr:false`，注册期安全性由 plugin.server 既有不变量覆盖
