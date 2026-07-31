# Changelog

本项目的所有显著变更都将记录在此文件中。

格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)。

## [Unreleased]

## [0.1.0-alpha.0] - 2026-07-31

首次公开发布（alpha）：schema 驱动的 Vue 组件渲染系统全链路首发——从低代码组件定义（schema）到运行时渲染，含核心渲染链、流式渲染管线、Nuxt 模块与六套物料包。

### Added

- `@lionad/cx-definition`：schema 层——组件元类型系统、`defineCxComponent`（别名 `define`）物料声明工厂、`cxNode` / `createCxID` 节点声明工厂、`CxMaterialBundle` 物料包自描述协议、物料 loader 与事件调度
- `@lionad/cx-vue`：Vue 运行时——渲染 composables（表格、排序、属性样式等）、共享运行时组件与 BEM 样式平台（`@lionad/cx-vue/styles`）
- `@lionad/cx-render`：schema 驱动 Vue 渲染器，支持物料 bundle 导出与 SSR
- `@lionad/cx-stream`：流式结构化渲染管线——增量解析不完整 LLM JSON 为可渲染组件树；声明式多形态流式触发器 DSL，支持 array 增量、region 区域揭示、array+region 组合与 stateBranch 空态透传
- `@lionad/cx-nuxt`：Nuxt 模块——物料包插件化装配（bundles 声明 + 虚拟模块 + 依赖去耦）与内置物料集注册
- `@lionad/cx-comps`：基础物料包——状态桥、动作编排、toast、导航、派生计算（受限表达式求值器）、骨架屏、滚动条、日历等
- `@lionad/cx-comps-element-plus`：Element Plus 物料包（27 件 schema 驱动包装）
- `@lionad/cx-comps-naive-ui`：Naive UI 物料包（27 件，attrs 双桥接）
- `@lionad/cx-comps-nuxt-ui-v2`：Nuxt UI v2 物料包
- `@lionad/cx-comps-nuxt-ui-v4`：Nuxt UI v4 物料包（对齐官方 6 分类 70 组件，全量流式声明）
- `@lionad/cx-comps-vtu`：tool-ui-vue（vtu）tool-call widgets 物料包（14 件流式声明）
- [internal] `@lionad/cx-eslint-config`：共享 ESLint flat config（含组件命名、追踪标记、颜色约束三条自研规则），仅仓内使用不发布
