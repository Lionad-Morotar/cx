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

## 根节点形态契约

渲染器会给每个非 headless 物料注入运行时指令与标识 class，只有「渲染出单元素根」的物料能正确接收：

- 模板根禁止 template v-if 包裹多分支（渲染为 Fragment）或 v-if 落空（渲染为 Comment 占位）——两者在 dev 下触发「directive used on non-element root node」警告，按节点实例 × 每帧刷屏
- 正确形态：根级 v-if/v-else-if/v-else 三元链直接返回元素 vnode；截断占位用 hidden 元素（`<div v-else hidden>`），不用注释节点
- 装多子并列布局时（如链区三列），以 cx-block 容器承载子物料——物料预设 flex 子项语义（定宽、flex-shrink:0、height:100%）只有在 flex 容器内才生效

## DTO 混型归一化

Server DTO 类型声明须以真实接口字节为准（先验证再声明），接口混型在生成器组装层归一化为物料 prop 契约，不直达渲染侧：

- 实测先例：链节点 countByRegion 对无区域统计节点返回空串 `""` 而非 0；企业卡 investmentScore 返回字符串数字 `"930.21"`
- 脏数据透传触发 Vue prop 类型校验警告，流式回放期按实例 × tick 放大刷屏（曾一次回放 2.8 万条）
- DTO 声明对齐实况（number | ''、string | null），组装函数内 `Number(x) || 0` / 空串判 null 归一化；spec fixture 用接口混型形态、断言归一化后契约形态，两头都防回归

## 半受控物料契约（内部交互态 + data-in 通道）

物料内部持有交互态（tabs 激活项、展开态等）且 props 提供外部驱动通道时，内部态与 props 的同步方式决定流式存活率：

- 内部态只存用户手动选择，呈现态渲染期推导：手动选择仍合法则优先，否则解析 data-in prop（缺省/失效回落缺省项）——无 watch 同步链，推导结果是稳定原始值，帧引用抖动天然免疫
- data-in prop 按值同步（watch 原始值 getter）：值变化时清空手动选择重新落地；目标项随数据生长到位即激活，中途外部驱动（伪联动）不丢
- 禁止 watch props 对象引用（含派生 computed）同步内部态：流式回放每帧产出新引用，watch 按帧触发把用户操作冲掉（实证：cx-tabs 点击 tab 一个 tick 内被拉回）
- 点击处理幂等（同值早退不重复 emit）；交互经 emits 外抛 data-out 通道（fire-and-forget，父级不接也自洽），meta emits 同步声明
- 先例：el-tabs currentName（内部态 + watch(() => modelValue) 按值同步 + update:modelValue 外抛）；渲染期推导回落与 React 官方「calculate during rendering」同款

## 图表物料（echarts）流式防御

流式场景 options 逐帧到达，中间帧是增量解析的半成品。图表包装组件须具备以下防御（实证先例 components/cx/shared/CxEchart.vue），缺一不可：

- undefined 深扫闸门：帧内出现 undefined 即跳过（字段未到位），否则 paint 阶段异步爆炸（渐变 colorStops 缺 color 等）
- legend-series 一致性闸门：legend.data 引用 ∉ series 名字（含饼图 data item 名）的帧跳过，否则 merge 模式逐条 dev 警告「series not exists」
- 0 尺寸不 init：v-show 隐藏面板内容器 0×0，echarts init 会告警且转可见后不自动重排；等 ResizeObserver 报告非 0 再建实例（已建则 resize）
- rAF 合并调度：回放 20 次/秒的 watch 高频 setOption 会撞 echarts 主流程重入，一帧合并一次渲染
- catch 后 dispose 重建（不是吞掉继续）：echarts setOption 内同步 paint（zr.flush）位于其主流程标志复位之前且不在 try 保护内，爆炸后标志永久卡死、后续 setOption 全被拒（`setOption should not be called during main process`），只能 dispose 置 null、下一帧走统一入口重建
- 值级闸门拦不住流式截断的合法坏值（chunk 边界切在颜色串中间，`'#F7B05'` 是合法 JSON 值），catch-重建是兜底，不能省略

## 验收判据（切片完成标准）

- 物料目录形态：index.ts（define 元数据）+ src/index.vue（实现），经宿主插件注册
- 单测覆盖组装函数（枚举翻译、前缀口径、空态）与 schema 结构（data 透传、_cx_events 形态）
- 冒烟：页面渲染出物料且 console 无 attr 穿透告警、无组件注册失败
