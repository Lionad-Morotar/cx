---
name: cx-stream-page
description: 把业务页面组件 cx 化并以 cx-stream 流式渲染演示页（S 页面）的全流程技能：抓数预录、物料 Fork 改造、剧本生成、增量 trigger 声明、舞台搭建、验收。当任务涉及「cx 化」「流式渲染页面」「S 页面」「cx-stream 演示」「剧本 chunks」时使用本技能；仅修改既有物料样式或修复单点 bug 时不适用。
metadata:
  version: 0.1.0
---

# cx-stream-page：业务页面的 cx 化与流式渲染演示

## 前置硬事实（先接受再动手，逐条都有源码锚点）

- CxRender 对顶层数组**只渲染首元素**：页面 schema 必须以单根容器（cx-block 或等价布局物料）包裹全部兄弟物料（packages/stream/src/cx.ts 的 CxSpec 注释）。
- 物料 emits **不会自动广播**：渲染器 compEmitNames 只接线节点 `data._cx_events` 登记过的事件（meta emits ∩ _cx_events），条目须 CxEvent 三必填（id/key/subs），缺 subs 会让 cx-emitter 广播读 `undefined.forEach` 抛错。
- 渲染器标识是 class 三件套 `is-cx-component` / `cx-<id>` / `is-<key>`，经 attr fallthrough 落地；`inheritAttrs: false` 的物料会整口吞掉，须沿模板链逐跳 `v-bind="$attrs"` 恢复。
- 参照实现两份：本 repo `playground` 的 /dev/stream/pages（舞台交互与剧本语义源头）；shushi.86links.com 的 `dev/industry-chain-*.ts` + `pages/dev/cx/industry-chain.vue`（本技能首个实证先例，含真实数据全套）。

## 流程六阶段

按阶段读取对应 reference，不要初始化时一口气全读。

### 1. 抓数预录

目标：把页面依赖的接口数据固化为本地可重放的剧本原料。

- 选 1 个有代表性的业务节点做全套抓数（curl 落 zRefs/req-*/），其余层级数据取全量平铺接口
- 敏感数据（JWT、企业数据）只落 zRefs 与被 git exclude 的路径，剧本产物不入库
- 产出：`scenario data` 纯数据对象（Server DTO 形态直消费，前端不重映射）

### 2. 物料 Fork 改造

目标：把业务组件改造为零宿主依赖的 cx 物料（components/cx/<name>）。纪律与判据见 [references/material-fork.md](./references/material-fork.md)：剥离 svc/mittBus、视图模型隔离、emits 元数据声明、BEM 与 is-* 单轨、JSON 序列化兼容、空态分支接管、attrs 透传链。

### 3. 剧本生成器

目标：数据 → schema → 带 json 围栏的 pretty JSON → 行边界累积 chunks（复刻 playground buildPageScenario 语义）。

- 生成器必须是纯函数、零 nuxt 依赖（vitest node 环境直接驱动）
- id 全部语义值（确定性：chunks 逐位比对测试，禁用随机 id）
- 可交互节点在此注入完整 CxEvent 形态的 `_cx_events`
- 单根容器包裹全部舞台物料，rootKey 取容器 key

### 4. 增量 trigger 声明

目标：为每件物料写流式形态判定表，注册树级 registry。形态决策树与判据见 [references/trigger-declaration.md](./references/trigger-declaration.md)：scalar/array/region/组合四形态、emptyPassthrough、region 叶子误剔规避、skeletonFields 只列必填长字段、无声明容器的 prune 语义。

### 5. 舞台搭建

目标：S 页面（layout: false 空白布局）复刻 playground 舞台交互——增量渲染铺满舞台、播放控制收底部悬浮控制器、调试折叠抽屉。

- 管线：createSpecDetector + useIncrementalTree(pendingSource, {registry, matchTrigger})
- 增量视图数据源必须回落终态树（finish 直跳压缩中间帧，lastFrame 从未更新而非被清空）
- 伪联动经 `cx.hooks.on('comp:cx-event:emit')` 消费，覆盖层作用于渲染节点不污染管线缓存
- 页面级样式覆盖物料 DOM 必须 `:deep()`（CxRender 渲染的物料无页面 data-v 属性）
- 舞台 grid 钉视口高、内容列内滚动（物料预设「父容器有界」前提，行高无约束会被内容撑破）

契约类排障（症状 → 成因 → 做法对照）统一查 [references/schema-contracts.md](./references/schema-contracts.md)。

### 6. 验收

目标：双视图渲染等价 + 伪联动闭环 + console 零错误。脚本形态与断言清单见 [references/acceptance.md](./references/acceptance.md)：BEM 锚点分件计数、增量=终态等量、link-hint 与激活面板断言、全量测试收尾。

## 红线速览（最容易翻车的五条）

1. 多根兄弟 schema 直接喂 CxRender——只出首元素，其余静默消失；必须单根容器
2. `_cx_events` 写 `{ key }` 简写——功能能用但 console 有 emitter TypeError；必须三必填
3. 验收用 `.is-cx-component` 全量计数——inheritAttrs:false 物料被漏成误报；用物料 BEM 分件计数
4. 增量视图只接 lastFrame——finish 直跳后空白；`lastNodes ?? finalNodes` 回落
5. 剧本产物提交入库——含真实业务数据；只提交生成器，剧本由构建脚本重建

## references 路由

#### 物料 Fork 改造纪律
[material-fork.md](./references/material-fork.md)：剥离宿主依赖、视图模型隔离、emits/样式/序列化判据

#### 增量 trigger 形态决策
[trigger-declaration.md](./references/trigger-declaration.md)：四形态决策树、emptyPassthrough、叶子误剔规避、skeletonFields 判据

#### schema 契约排障
[schema-contracts.md](./references/schema-contracts.md)：渲染与交互契约的症状→成因→做法对照（单根/事件/标识 class/attrs/:deep/echarts/中间帧）

#### 验收脚本形态
[acceptance.md](./references/acceptance.md)：Playwright 断言清单、BEM 锚点、双视图等价、console 清零门
