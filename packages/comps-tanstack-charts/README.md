# @lionad/cx-comps-tanstack-charts

TanStack Charts（`@tanstack/charts/vue`）的 cx 物料包：以纯 JSON schema 驱动 `defineChart` 的声明式翻译层 + 物料集。

- 通用物料 `cx-chart`：完整 JSON definition 投影（marks/x/y/theme/tooltip 标量子集）
- 预设物料：`cx-tanstack-charts-line` / `-bar` / `-area` / `-dot` / `-pie`（data + channel 字段名 + 样式子集）

JSON 化取舍：scale/curve 以声明式描述经翻译层转运行时实例；channel 仅支持字段名字符串；format/accessor/tooltip content 等回调不暴露。
