---
name: cx-stream-page
description: 把业务页面组件化改造并做流式渲染演示页(Stream 页面)的全流程技能：抓数预录、组件 Fork 改造、剧本生成、增量 trigger 声明、舞台搭建、验收。当任务涉及「组件化改造」「流式渲染页面」「Stream 页面」「流式演示」「剧本 chunks」时使用;仅修改既有组件样式或修复单点 bug 时不适用。cx 体系的组件契约与渲染排障背景知识统一查 cx-context 技能。
metadata:
  version: 0.4.0
---

# cx-stream-page：业务页面的组件化与流式渲染演示

不限于特定组件体系；当前实证先例均在 cx 体系内，cx 专属契约（单根渲染、事件接线、物料防御、trigger 形态）经 cx-context 技能承载，本技能按阶段链接过去。

## 流程六阶段

按阶段读取对应 reference 与 cx-context 文档，不要初始化时一口气全读。

### 1. 抓数预录

目标：把页面依赖的接口数据固化为本地可重放的剧本原料。

- 选 1 个有代表性的业务节点做全套抓数（curl 落 .tmp/reqs/*/），其余层级数据取全量平铺接口
- 敏感数据（JWT、企业数据）只落 .tmp 与被 git exclude 的路径，剧本产物不入库
- 产出：`scenario data` 纯数据对象（Server DTO 形态直消费，前端不重映射）

### 2. 组件 Fork 改造

目标：把业务组件改造为零宿主依赖的流式渲染物料（数据经 props 进、交互经 emits 出）。

- 改造纪律：剥离 svc/事件总线、视图模型隔离（组装函数纯函数可单测）、emits 元数据声明、空态分支接管——通用判据与 cx 物料细则（BEM 单轨、JSON 序列化兼容、根节点形态、DTO 混型归一化、半受控契约、echarts 流式防御五件套）见 cx-context 技能 [material-contracts.md](../cx-context/references/material-contracts.md)

### 3. 剧本生成器

目标：数据 → schema → 带 json 围栏的 pretty JSON → 行边界累积 chunks（复刻 playground buildPageScenario 语义）。

- 生成器必须是纯函数、零框架运行时依赖（vitest node 环境直接驱动）
- id 全部语义值（确定性：chunks 逐位比对测试，禁用随机 id）
- 可交互节点在此注入完整形态的事件登记（如 cx 体系 `_cx_events`，契约见 cx-context）
- DTO 类型以真实接口字节为准（含混型），组装层归一化为组件 prop 契约再入 schema——脏值透传会被流式回放按实例 × tick 放大成 prop 校验警告刷屏
- 单根容器包裹全部舞台物料，rootKey 取容器 key；同级并列布局组以容器物料（如 cx-block）承载成单节点

### 4. 增量 trigger 声明

目标：为每件物料写流式形态判定表，注册树级 registry。

- 形态决策树与判据（scalar/array/region/组合四形态、emptyPassthrough、region 叶子误剔规避、skeletonFields 只列必填长字段、无声明容器的 prune 语义）见 cx-context 技能 [stream-triggers.md](../cx-context/references/stream-triggers.md)

### 5. 舞台搭建

目标：Stream 页面（layout: false 空白布局）复刻 playground 舞台交互——增量渲染铺满舞台、播放控制收底部悬浮控制器、调试折叠抽屉。

- 管线：createSpecDetector + useIncrementalTree(pendingSource, {registry, matchTrigger})
- 增量视图数据源必须回落终态树（finish 直跳压缩中间帧，lastFrame 从未更新而非被清空）
- 伪联动经渲染器事件总线消费（cx 体系为 `cx.hooks.on('comp:cx-event:emit')`），覆盖层作用于渲染节点不污染管线缓存
- 页面级样式覆盖物料 DOM 必须 `:deep()`（渲染器渲染的物料无页面 scoped 属性）
- 舞台 grid 钉视口高、内容列内滚动（组件预设「父容器有界」前提，行高无约束会被内容撑破）

### 6. 验收

目标：双视图渲染等价 + 伪联动闭环 + console 零错误。脚本形态与断言清单见 [references/acceptance.md](./references/acceptance.md)：分件锚点计数、增量=终态等量、联动链路断言、全量测试收尾。流式放大效应下 warning 同样纳入统计（总量个位数为界）；console 消息页面侧截断存储防 driver OOM。

## 红线速览（最容易翻车的八条）

1. 多根兄弟 schema 直接喂渲染器——cx 体系只出首元素，其余静默消失；必须单根容器（成因与做法见 cx-context schema-contracts.md）
2. 事件登记写 `{ key }` 简写——功能能用但 console 有 emitter TypeError；cx 体系 CxEvent 三必填（id/key/subs）
3. 验收用渲染器标识 class 全量计数——inheritAttrs:false 物料被漏成误报；用组件自身 BEM 分件计数
4. 增量视图只接 lastFrame——finish 直跳后空白；`lastNodes ?? finalNodes` 回落
5. 剧本产物提交入库——含真实业务数据；只提交生成器，剧本由构建脚本重建
6. 物料根用 template v-if 包分支或 v-if 落空占位——Fragment/Comment 根与渲染器指令注入不兼容；根级三元链 + hidden 元素占位
7. echarts setOption 炸了就吞异常继续用——同步 paint 爆炸让实例主流程标志永久卡死，后续全拒；必须 dispose 重建
8. 半受控组件 watch props 对象引用同步内部交互态——流式每帧新引用按帧冲刷用户操作；按值同步 + 渲染期推导回落

## references 路由

#### 验收脚本形态
[acceptance.md](./references/acceptance.md)：Playwright 断言清单、锚点分件计数、双视图等价、console/warning 清零门、大消息量采集（截断+聚合防 OOM）

#### cx 体系背景知识
cx-context 技能（[SKILL.md](../cx-context/SKILL.md)）：体系总览、物料改造纪律（material-contracts.md）、契约排障（schema-contracts.md）、trigger 形态决策（stream-triggers.md）——阶段 2/4/6 与排障时按需读取
