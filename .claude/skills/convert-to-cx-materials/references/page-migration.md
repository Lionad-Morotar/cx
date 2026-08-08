# 页面迁移 Playbook：业务页 → 宿主本地物料

> 场景：把既有业务页的组件树（含容器）整体 cx 化为「宿主本地物料」（`components/cx/<name>`），
> 页面经深路径 import 直接消费，双页并行验证后一键替换旧页。
> 与主线（组件库 → monorepo 物料包）是两种转换场景：物料 API 同为 `define()`，其余几乎全不同。

## 何时走本 playbook

| 轴 | 库物料包（主线） | 页面迁移（本 playbook） |
| --- | --- | --- |
| 物料来源 | 外部/内部组件库 | 既有业务页的组件树（搜索区/链图/tabs/列表面板…） |
| 落点 | `packages/comps-<lib>/` | 宿主 `components/cx/<name>/{index.ts, src/index.vue}` + 桶 `components/cx/index.ts` |
| 注册 | cx-nuxt 虚拟模块（`#build/cx-bundles.mjs`） | 宿主 `plugins/cx-materials.ts` 静态链注册进 CxLoader |
| 消费 | `<CxRender>` schema 驱动 | 页面深路径 import 直接消费（交互页非 schema） |
| 验收对象 | 物料契约完备 + 带样式渲染 | 与旧实现逐行为等价 |
| 收尾 | 无 | 路由不变式替换 + 死代码清除 |

注册插件形态（宿主侧，依赖 cx-nuxt pre plugin 先行提供的 cx 实例）：静态 import 桶 → 过滤挂 `_cx_meta` 的导出 → 逐个 `installComponent(key, comp)` 并置 `type='local'`。注册后 schema 可驱动渲染，与页面直 import 两条消费链并存、互不影响。

## 不可违反的不变量（页面场景，违反=白屏/静默失效）

1. **import service 的物料，meta 组件必须 `defineAsyncComponent` 包裹**。

   ```ts
   const component = defineAsyncComponent(() => import('./src/index.vue'))
   ```

   物料注册走插件静态链，求值早于 Nuxt instance 就绪；静态 import 的 SFC 若（传递）import service 模块，其顶层 Nuxt composable（`useRuntimeConfig()` 等）连带执行即炸，整页白屏。页面深路径 import 在路由懒加载链内（Nuxt 已就绪）不受影响——所以只有注册链白屏、直 import 正常，极易误判为路由问题。判据=物料 SFC 是否 import service 层，纯展示物料不受影响。

   辨析：cx-definition meta 的 `async?: boolean` 仅是标记位（`withDefaultMeta` 里 `has(meta.async)`），不延迟模块求值，不能替代动态 import 包裹。

2. **物料模板根为另一组件时，前缀类显式写在根组件标签上**。Vue 单根 class fallthrough 只透传「显式写在组件标签上」的 class；不写则前缀类不在 DOM，以前缀类为作用域的非分层 scss 整段静默失效（无构建错误、无运行时报错）。排查「物料样式整段不生效」先查前缀类在 DOM 是否存在。

3. **对抗 EP 默认样式的声明不走 `@layer cx`，走非分层 scss**。EP dist css 是 unlayered，层序律 unlayered 胜任意 @layer 内规则、与特异性无关。含 EP 内部类深度覆盖的物料（el-scrollbar 高度、el-divider 间距等）样式段整体非分层，靠 source order 后写 + 前缀类特异性胜出。

4. **供给驱动渲染语义：undefined=未供给（行不渲染），空串/空数组=供给（行恒显）**。info 行 `!== undefined` 判定的物料，适配层必须区分「缺席」与「置空」。做法：DTO → props 映射抽成独立 `adapter.ts` 纯函数，配表征测试（characterization test）锁定混型分支（null/空串/数字串/缺席），防逐字迁移后的静默语义漂移。

5. **html2canvas 捕获定高滚动容器：只放 overflow，不动 height**。打印/导出场景临时放开裁剪时，`height:auto` 使容器内 percentage-height 子孙失去参照连锁塌缩（实证 900px 面板导出仅 223px）；定高容器 scrollHeight 本取容器与内容较大者。捕获前 `overflow=visible`、finally 复原；width/height 取 scrollWidth/scrollHeight；捕获前若驱动展开态变更（如全展开信号）须 nextTick 等 DOM 落定。

## 双页对比验收（与旧实现逐行为等价）

迁移类任务的验收对象不是物料本身，是「行为等价」。实证方法（脚本化，单次完整运行判定）：

1. **双页并行**：新页挂 `/cx/<page>`，旧页不动；同一数据源、同一账号态。
2. **交互路径脚本化**（playwright）：枚举核心交互路径（落地/筛选/分页/弹窗/导出…）双页逐项执行。
   - **请求形状比较代替值比较**：账号态（关注/订单）会漂移，业务 id 等值不可比；比较 URL 路径、方法、payload 键集、响应形状。请求过滤用 `urlsplit().path` + `endswith`(URL 路径末段)，别用 service 函数名（不在 URL 里）。
   - **旧页选择器须 DOM 探测取证**：分区标题/卡片/点击目标的类名逐 tab 不同，先探测再写断言，禁止凭印象。
   - **toast 类断言在自动消失前读取**（ElMessage 3s，读取窗口 <1.5s）。
   - **截图差异须归因后定容差**：折行点微差类（宽度 1-2px 差致长词折行位置不同、内容集一致）给 5% 容差并记决策台账。
3. **表征测试锁定旧语义**：适配器纯函数 + 供给键集/混型分支用例；图表 builders 复用既有场景测试覆盖。
4. **替换后回归冒烟**：核心交互全流一遍，console 零错误 + 物料注册数复核。

## 一键替换与死代码清除

- **路由不变式**：新实现搬家占据原路由，布局条件（needBack）/首页导航/服务端菜单/详情前缀承诺零改动——用 `git diff master` 为空来证明，不靠口头。
- **死代码清除前先 rg 零引用确认**：表面命中须甄别（同名局部变量、其他目录同名组件、注释提及），Nuxt auto-import 的模板消费也算引用。
- 删除后全量测试 + 回归冒烟双绿才算完成。

## 实证锚点

shushi.86links.com 产业洞察页迁移（2026-08）：10 Slice / 11 commit；双页十二交互路径 17/17 PASS；表征测试 58 绿；旧实现 5171 行清除；零改动清单 `git diff master` 为空。
