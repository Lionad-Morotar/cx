# cx 体系总览

schema 驱动的 Vue 组件渲染系统全链路。面向零上下文读者，讲清各机制的归属与协作，不讲实现细节（细节查对应契约文档）。

## 包依赖链

- definition：schema 层——组件元类型、normalize、loader、事件与钩子内核
- vue：Vue 运行时——composables 与共享运行时组件
- renderer：schema 驱动的 Vue 渲染器（CxRender 所在层）
- stream：流式渲染管线——增量解析 LLM 不完整 JSON 为可渲染组件树
- comps / comps-\*：物料包（基础组件、ECharts、各 UI 库包装：element-plus、naive-ui、nuxt-ui-v2/v4、vtu、tanstack-charts）
- nuxt：Nuxt 模块集成

依赖方向 definition → vue → renderer → comps-\* → nuxt；宿主 UI 库一律 peerDependencies，与 cx 发版解耦。

## schema → 渲染链路

- schema 是组件树的 JSON 描述：节点 = 组件 key + data（props 数据）+ 可选 children / slots
- CxRender 消费 schema 逐节点实例化物料，顶层数组只渲染首元素——页面 schema 必须单根容器承载（契约详见 schema-contracts.md「渲染契约」）
- 渲染器给每个非 headless 物料注入运行时指令与标识 class 三件套（is-cx-component / cx-\<id\> / is-\<key\>），经 attr fallthrough 落地
- 物料 props 即 schema 节点 data 的直消费形态——前端不做重映射，DTO 归一化发生在组装层（详见 material-contracts.md「DTO 混型归一化」）

## 物料形态

- 目录：index.ts（define() 元数据：props/emits 声明）+ src/index.vue（实现），经宿主插件注册
- define() 的 emits 逐项声明 key + name + description——渲染器 compEmitNames 按此与节点 data._cx_events 求交集接线；声明了 emits 不等于会广播，schema 必须自己注入 _cx_events
- CxEvent 三必填：id / key / subs（缺 subs 会产生 console TypeError，详见 schema-contracts.md「交互契约」）

## 事件与钩子

- 物料 emits → 渲染器接线 → cx.hooks 总线广播：`cx.hooks.on('comp:cx-event:emit', ...)` 可在页面层消费物料事件做联动
- 事件载荷为平铺关键字段对象，不抛整个 props；原生 DOM 事件走 nativeEvents 通道，与自定义语义事件不混用

## 流式管线

- 入口组件：createSpecDetector（检测流式 source 是否到达终态）+ useIncrementalTree(pendingSource, { registry, matchTrigger })（增量解析为组件树）
- 增量 trigger：每件物料的流式形态判定表，经 compileTreeTrigger + createTriggerRegistry 注册为树级 registry（rootKey 取剧本根容器 key）；四形态决策详见 stream-triggers.md
- 增量帧经结构共享（structural sharing）：同值子树跨帧引用稳定，渲染器按引用跳过 patch；物料不得依赖此优化替代自身按值同步契约
- 回放控制：逐字符播放出中间帧；finish() 直跳终态会压缩中间帧，增量视图数据源须回落终态树（lastNodes ?? finalNodes）

## 硬事实速查

- CxRender 顶层数组只渲染首元素——单根容器
- 物料根必须是单元素 vnode——Fragment / Comment 根与渲染器指令注入不兼容
- 渲染器标识 class 经 attr fallthrough 落地——inheritAttrs: false 物料须沿模板链逐跳 v-bind="$attrs"
- 流式中间帧是半成品——图表物料须经闸门跳过，setOption 爆炸后必须 dispose 重建（详见 material-contracts.md「图表物料流式防御」）
- 参照实现：cx 仓 playground /dev/stream/pages（语义源头）；shushi.86links.com dev/industry-chain-\*（实证先例）
