# Changelog

本项目的所有显著变更都将记录在此文件中。

格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)。

## [Unreleased]

## [0.1.0-alpha.1] - 2026-08-03

### Added

- `@lionad/cx-stream`：声明式流式触发器 DSL 新增 scalar 标量形态——短属性与标量主体物料可声明式流式揭示，含标量闭合事件扫描器 `scanStreamEvents`、帧节流与管线闭合事件回退
- `@lionad/cx-stream`：流式管线终态兜底——`scanPath` 主路径完整 JSON 终态短路，标量回退输入终态直出完整帧，任意输入终止形态下组件树终态完整可查
- `@lionad/cx-comps-vtu`：29 件物料全量流式声明——短属性与长主体 scalar、长主体 wrapper `StreamSkeleton` 骨架（含 article 正文骨架），流式注册全汇聚
- `@lionad/cx-comps`：9 件基础物料标量主体流式声明与触发注册
- `@lionad/cx-comps-nuxt-ui-v4`：alert / avatar / banner / empty / error / user 六件标量主体流式声明与触发注册
- `@lionad/cx-comps-element-plus`：10 件物料流式判定声明，汇聚迁移新 sections DSL
- `@lionad/cx-comps-naive-ui`：12 件物料三形态（array / scalar / region）流式声明与注册汇聚
- [internal] playground：全物料包 variants 六分类深化展示与回放链路逐件验证（vtu / comps / nuxt-ui-v4 / element-plus / naive-ui）

### Fixed

- `@lionad/cx-comps-nuxt-ui-v4`：U* 离线 stub 作用域槽改为对象调用
- `@lionad/cx-comps-nuxt-ui-v2`：table `useAttrs` 交叉类型收窄为可达声明
- `@lionad/cx-render`：TS7 下 30 处类型错误清零（hooks payload 对齐注册表、slots 函数签名断言到 SlotContext 调用约定、watch 源数组 tuple 化等）；`@lionad/cx-vue` 的 `useMarkRaw` 签名与「空值直通」实现对齐（`x: T | undefined`）
- [internal] build：根构建自指空转修复（`vp run build` 循环检测致产物长期为开发残留，改 `pnpm -r` 拓扑递归）；release 全链测试双跑修复（pnpm 与 vp 双生命周期叠加）
- [internal] playground：uuid 升级 ^14 修复 vitest ESM 互操作崩溃，typecheck 切换 vue-tsgo；vite / vitest 别名经 `fileURLToPath` 可移植化
- [internal] release：dry-run 逐包实测 tarball 完整性，拦截打包工具链丢产物

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
