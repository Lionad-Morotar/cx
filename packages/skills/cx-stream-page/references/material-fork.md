# 物料 Fork 改造纪律

业务组件 → cx 物料（components/cx/<name>）的改造判据。目标形态：物料零宿主依赖（不调 svc、不碰 mittBus/全局 store），数据经 props 进、交互经 emits 出。

## 剥离宿主依赖

- 删除 svc 调用与响应式数据拉取：物料只收 props，数据组装移到页面/生成器侧的视图模型层
- 删除 mittBus 等全局事件总线订阅：对外交互一律改为物料 emits
- 删除路由跳转（router.push）：点击行为 emits 外抛，由页面决定跳不跳
- 保留纯呈现逻辑（格式化、枚举翻译、条件显隐），但枚举翻译若跨物料复用应上移到视图模型组装函数

## 视图模型隔离

物料不直传服务端 detail 对象，只收组装好的视图模型（items/tops/stats/chart 等）：

- 组装函数（如 buildAiItems/buildScaleTops）放生成器侧纯函数文件，可单测
- 前缀/口径处理（substring 去「·近5年总融资金额：」类前缀）在组装层完成，口径以真实数据为准——先 jq + cat -A 实证原始字符串再定截取位
- 空态语义：detail 无 id 视为未配置，组装函数返空数组；物料按空数组整卡不渲染（空态分支接管），不要造占位数据

## emits 元数据声明

- 物料 define() 的 emits 逐项声明 key + name + description（渲染器 compEmitNames 按此与 _cx_events 求交集接线）
- emits 载荷为平铺关键字段对象（nodeId/name/level 等），不抛整个 props
- 原生 DOM 事件（click 等）走 nativeEvents 通道，自定义语义事件走物料 emits，不要混用

## 样式纪律

- BEM 经 useCxBEM 生成，状态色变体用 is-* class 单轨驱动——禁止「内联 style + class」双轨（审查曾指出双轨必然漂移）
- 多状态色映射用 SCSS map + @each 生成双处覆盖（block 根与内部元素），双 class 选择器（.cx-foo.is-BAR）天然压过单 class 基础样式，无需 !important
- active/selected 态有边框时，默认态必须等宽透明边框占位（防 layout shift）
- 物料宽高语义保持「父容器有界」前提：height:100% 类样式预设页面提供有界容器与滚动上下文

## JSON 序列化兼容

物料 data 会经剧本 JSON 序列化（流式 chunks），禁止函数值：

- echarts options 等含 formatter 函数的对象，组装后以 sanitizeFunctions 递归剔除函数值（JSON 序列化兼容校验：JSON.parse(JSON.stringify(x)) 与原对象同构）
- 单测断言此同构性，防静默丢函数导致图表行为偏差

## attrs 透传链

物料需要被验收/e2e 定位时：

- defineOptions inheritAttrs: false 会吞掉渲染器标识 class（is-cx-component/cx-<id>/is-<key>）与显式 data-testid
- 根元素是包装组件时，沿模板链逐跳 v-bind="$attrs"（物料 → 包装组件 → 包装组件根元素），一跳缺失全链落空
- 保留 inheritAttrs: false 防杂散 attr 落 DOM 时，显式 v-bind="$attrs" 到根元素即可兼得

## 验收判据（切片完成标准）

- 物料目录形态：index.ts（define 元数据）+ src/index.vue（实现），经宿主插件注册
- 单测覆盖组装函数（枚举翻译、前缀口径、空态）与 schema 结构（data 透传、_cx_events 形态）
- 冒烟：页面渲染出物料且 console 无 attr 穿透告警、无组件注册失败
