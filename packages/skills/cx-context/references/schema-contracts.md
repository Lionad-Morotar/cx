# schema 契约排障

手写/生成 cx schema 的渲染与交互契约，按「症状 → 成因 → 做法」对照。每条附源码锚点（行号以实证时版本为准，漂移时按符号名搜索）。

## 渲染契约

### 症状：多根 schema 只渲染出第一个节点

成因：CxRender 对顶层数组只渲染首元素（packages/stream/src/cx.ts 的 CxSpec 注释：「多节点建议用布局容器承载」）。弯路：先怀疑增量管线修剪过度、再怀疑 trigger rootKey 不匹配，两方向都证伪后才看到这条注释。

做法：页面 schema 单根容器（cx-block 等）包裹全部兄弟物料；trigger registry 的 rootKey 同步取容器 key；spec 断言单根结构防回归。

### 症状：物料 DOM 上没有 is-cx-component / data-testid，验收锚点全空

成因：渲染器标识 class 经 attr fallthrough 落地（render-component-with-bindings.vue 打 is-cx-component/cx-<id>/is-<key> 三件套），物料 defineOptions inheritAttrs: false 时整口吞掉；根元素是包装组件（如 CxPanoBox）时吞噬沿链发生，逐跳都丢。

做法：沿模板链逐跳 v-bind="$attrs"（物料 → 包装组件 → 包装组件根元素）。验收锚点改用物料自身 BEM block class 分件计数，不用 .is-cx-component 全量计数（覆盖不全时误报）。

### 症状：页面级 CSS 覆盖物料样式不生效

成因：页面 `<style scoped>` 的选择器编译后带 data-v 属性限定，CxRender 渲染的物料 DOM 没有该属性，选择器落空。表现：样式写了、devtools 里规则灰色未命中。

做法：覆盖选择器一律 `:deep()` 穿透（如 `.page-stage :deep(.cx-grid)`）；压物料内联样式（cssVars）时 !important 是唯一路径，注释写明 why。

### 症状：v-show 面板里的 echarts 空白

成因：隐藏面板 display:none 时容器 0×0，echarts 按 0 尺寸完成 init 后自身不监听尺寸变化，面板转可见不重排。

做法：图表包装组件挂 ResizeObserver，尺寸 0 转非 0 时 chartInstance.resize()，卸载 disconnect。v-if 无此问题（转可见才挂载），只有 v-show/CSS 隐藏类场景需要。

## 交互契约

### 症状：物料 emits 后 cx.hooks 总线收不到（伪联动静默断裂）

成因：render-component.vue 的 compEmitNames 只接线节点 `data._cx_events` 数组登记过的事件（物料 meta emits ∩ _cx_events 键交集）。编辑器场景该数组由设计器事件面板生成，手写/生成 schema 必须自己注入——物料 define() 声明了 emits 不等于会广播。

做法：生成器为每个可交互节点注入 `_cx_events: [{ id, key, subs: [] }]`；spec 断言透传防回归。

### 症状：联动能用但 console 有 emitter TypeError（undefined.forEach）

成因：_cx_events 条目简写 `{ key }` 缺 subs——CxEvent 契约 id/key/subs 三必填（类型无问号但 data 是 Record 不校验），cx-emitter 广播时读 mainEvent.subs.forEach 抛错，被渲染器 errorCaptured 吞成 console 噪音，hooks 链不受影响所以功能看似正常。

做法：条目写全三字段，无组件间订阅时 subs 置空数组。该字段在渲染侧 useOmit 剔除清单内，不会穿透成 DOM 属性。

### 症状：finish 直跳后增量视图空白（detector 已 success）

成因：回放引擎 finish() 把字符偏移直推终点，source computed 从中间值一步跳到终态，Vue computed 惰性求值链压缩全部中间帧——extractor 从未见过中间文本，只在终态被求值一次；终态 pendingSource 为空串出 null，useLastFrame 的「最后非空帧」从未更新（不是被清空）。

做法：增量视图数据源回落终态树（lastNodes ?? finalNodes）——增量管线与终态渲染是同一棵树的两种时态。逐字符播放无此问题（含后台 tab 被 intensive throttling 压拍的长回放）。

## 布局契约

### 症状：链区/长列表只显示顶部一小条 + 大片空白 + 底部零星内容

成因：物料预设「父容器有界」前提（section height:100%、tabs panels flex:1），grid 行高无约束时被内容撑到数倍视口，section 又被 grid 行 align stretch 拉成等高空白；舞台 overflow hidden 裁掉视口外内容。

做法：页面层 `:deep()` 钉 grid 视口高（height:100vh）、内容列各自 overflow-y auto 内滚动（Fork 原版 el-scrollbar 100vh 语义）、列宽 auto + 1fr 随物料定宽；被拉伸的容器回落 height:auto 顺排。
