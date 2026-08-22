---
name: cx-context
description: cx 组件体系的背景知识库：schema 驱动渲染链路、物料改造纪律、渲染与交互契约排障、流式增量 trigger 形态决策。当任务涉及「cx 物料」「CxRender」「_cx_events」「cx schema」「流式渲染契约」「trigger 声明」或需要在 cx 仓库 / cx 化页面上做组件改造与排障时使用；也是 agent-manual、stream-page 等泛化技能的 cx 背景引用源。
metadata:
  version: 0.1.0
---

# cx-context：cx 组件体系背景知识

零上下文入口：不预设读者了解 cx。按使用场景路由到对应 reference，不要初始化时一口气全读。

## 体系一句话

cx 是 schema 驱动的 Vue 组件渲染系统：低代码组件定义（schema）经渲染器变成 Vue 组件树，流式管线把 LLM 增量产出的不完整 JSON 解析为可逐帧渲染的组件树。monorepo 依赖链 definition → vue → renderer → stream / comps-\* → nuxt。

## References 路由

#### 体系总览（先读这个）
[cx-architecture.md](./references/cx-architecture.md)：schema→渲染链路、物料 define() 形态、事件总线与 hooks、流式管线组件。第一次接触 cx 或需要定位某个机制归属包时读

#### 物料改造纪律
[material-contracts.md](./references/material-contracts.md)：业务组件 → cx 物料的改造判据——剥离宿主依赖、视图模型隔离、emits 元数据、BEM 单轨、JSON 序列化兼容、根节点形态、DTO 混型归一化、半受控契约、echarts 流式防御五件套。做物料 Fork / 审查物料代码时读

#### 契约排障
[schema-contracts.md](./references/schema-contracts.md)：渲染 / 交互 / 布局契约的「症状 → 成因 → 做法」对照（单根、标识 class、:deep、事件接线、finish 直跳回落）。排障或写验收断言时读

#### 流式 trigger 形态
[stream-triggers.md](./references/stream-triggers.md)：scalar/array/region/组合四形态决策树、emptyPassthrough、region 叶子误剔规避、skeletonFields 判据、registry 注册与断言。为物料声明增量 trigger 时读

## 引用约定

- 其他技能（如泛化后的 agent-manual、stream-page）引用本技能时，在自己的 references 或 SKILL.md 中指向本技能对应文档，并注明「cx 专属背景」
- 本技能只沉淀 cx 体系本身的契约与纪律，不承载任何页面工作流——流程归流程技能，知识归这里
- 文档内源码锚点（行号）以取证时版本为准，漂移时按符号名搜索
