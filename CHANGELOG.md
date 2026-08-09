# Changelog

本项目的所有显著变更都将记录在此文件中。

格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)。

## [Unreleased]

## [0.1.0-alpha.5] - 2026-08-10

### Fixed

- `@lionad/cx-stream`：增量提取器终态回落最后闭合块——闭合围栏大剧本终帧不再卡 lastValid
- [internal] release：发布脚本幂等跳过 registry 已存在版本——单包变更的 monorepo 发版与中途失败重跑不再撞 EPUBLISHCONFLICT

### Added

- [internal] docs：新增 cx-agent-manual 技能——业务页面转 agent 操作手册
- [internal] docs：convert-to-cx-materials 深化——页面迁移 playbook 与场景分流、物料 API 同步 define 更名、vtu 样式集成改宿主入口注入并沉淀具名失败模式与深色类碰撞

## [0.1.0-alpha.4] - 2026-08-09

### Fixed

- `@lionad/cx-stream`：`usePendingTypewriter` 新增 `finished` 选项——消息完成/停止（abort）时动画链立即定格（`flush: 'sync'` 断链），修复围栏永不闭合时主循环无限空转；一次性边沿语义，不封锁后续 `exit()` 删除动画
- `@lionad/cx-stream`：`useCxPendingExit` 的 `finished` 边沿打断进行中的退出删除动画——跳过逐字删除直接翻牌，修复停止信号到达后删除动画仍在播放

## [0.1.0-alpha.3] - 2026-08-08

### Fixed

- `@lionad/cx-vue`：BEM mixin 顶层预声明 `$B`/`$E`，消除 Dart Sass new-global 弃用警告
- [internal] docs：release.mjs 2FA 注释更正为 pnpm 12 web 授权流实际行为；CONCERNS 登记子包 .bin 残留 shim 劫持 PATH 坑点

## [0.1.0-alpha.2] - 2026-08-07

### Added

- `@lionad/cx-stream`：树级 trigger 编译器 `compileTreeTrigger`——组件级 trigger 语义进页面树，页面级流式编排从整页单 trigger 细化为组件各自声明
- `@lionad/cx-stream`：增量管线帧间结构共享——未变子树复用引用，降低流式回放内存与 diff 开销
- `@lionad/cx-stream`：`useCxPendingExit` 围栏闭合退出接管 composable——无围栏时 content 直通 undefined
- `@lionad/cx-stream`：页面剧本组装与流式回放 composable 三件套
- `@lionad/cx-definition`：`createEvent` 支持确定性 id 第二参数
- `@lionad/cx-vue`：`useCxAppends` 表单暂存单例
- `@lionad/cx-render`：卡片水合 / 增量管线 / 事件路由骨架三件套
- `@lionad/cx-comps`：新增通用 `cx-tabs` 物料——半受控激活态按值同步并补 change emit
- `@lionad/cx-comps`：`CxEchart` 共享组件上提（流式中帧防御）
- `@lionad/cx-comps-vtu`：物料×事件语义层——六件交互物料 emits 声明与真 emit 监听 re-emit 接线（对齐 vtu 0.3.8 契约），事件默认表 + 覆盖点；option-list 未配 actions 时压制 vtu 默认 Clear/Confirm；物料 meta initial 与 vtu SFC 消费契约对齐
- [internal] playground：流式验收体系成型——/dev/stream 拆分 components / pages 双验收页（全页舞台 + 悬浮控制器布局），页面级流式剧本与嵌套渲染适配，树级注册表与组件级语义嵌套验收，增量视图成功后停留末帧，验收页改消费 SDK 包机制
- [internal] docs：新增 cx-stream-page 技能，沉淀半受控物料契约、帧间结构共享与流式舞台实证坑点；新增 packages 子包职责一览

### Changed

- `@lionad/cx-definition`：`useHooks` 钩子内核从 kareem 迁移至 @middy/core（ESM-only）——消除浏览器 ESM 裸解析失败
- 物料包依赖治理：宿主 UI 库（element-plus、naive-ui、@iconify/vue、@lionad/vtu-components 等）统一转为 peerDependencies 与 cx 发版解耦；纯工具库 @vue/shared 统一为 dependencies 声明
- [internal] playground：standup 演示站点双主题 token 系统与主题开关物料，站会 / 日会 / 周会看板展示级重写；反向映射 --color-primary 修复 vtu shadcn token 劫持

### Fixed

- `@lionad/cx-comps`：grids-form 行列删除适配异步 removeComponent，快照修复隔位漏删
- `@lionad/cx-stream`：settle 冻结保留 pending-slot 生成中信号
- `@lionad/cx-render`：空指令数组不包 withDirectives
- `@lionad/cx-comps-nuxt-ui-v2`：补 uuid 依赖声明
- `@lionad/cx-nuxt`：optimizeDeps 物料集条目回归嵌套依赖语法
- `@lionad/cx-render`：TS7 下 30 处类型错误清零（hooks payload 对齐注册表、slots 函数签名断言到 SlotContext 调用约定、watch 源数组 tuple 化等）；`@lionad/cx-vue` 的 `useMarkRaw` 签名与「空值直通」实现对齐（`x: T | undefined`）
- [internal] build：根构建自指空转修复（`vp run build` 循环检测致产物长期为开发残留，改 `pnpm -r` 拓扑递归）；release 全链测试双跑修复（pnpm 与 vp 双生命周期叠加）

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
