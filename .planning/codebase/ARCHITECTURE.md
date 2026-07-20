<!-- refreshed: 2026-07-20 -->
# 架构（Architecture）

**分析日期：** 2026-07-20

## 系统概览

cx 是一个 **Schema 驱动（schema-driven）的 Vue 组件渲染系统**：消费方以 `CxComponentRuntime` 树描述界面结构，`CxRender` 把它递归渲染成真实的 Vue 组件树。整个仓库为 monorepo，由 6 个子包构成一条严格分层的依赖链，外加一个用于验收的 `playground` 沙箱。

```text
┌─────────────────────────────────────────────────────────────────────┐
│   Host App（宿主应用）                                                │
│   `playground/app/app.vue`、`playground/nuxt.config.ts`              │
│   生产消费方为 p-ray 编辑器 / 任意 Nuxt 站点                          │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ 注册 `@lionad/cx-nuxt` 模块
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│   @lionad/cx-nuxt（Nuxt 模块层）                                      │
│   `packages/nuxt/src/module.ts`                                      │
│   - `addComponent(CxRender)`                                         │
│   - 注入 server / client plugin（`packages/nuxt/src/runtime/*`）     │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ `installCxBundles` 按开关装配物料
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│   物料层（render / components / nuxt-ui-v4）                          │
│   `packages/renderer/src/cmpts/index.ts`        （CxRenderCmpts）     │
│   `packages/components/src/index.ts`            （CxBasics / Grid …） │
│   `packages/components-nuxt-ui-v4/src/index.ts` （CxNuxtUI / Card …） │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ 每个物料经 `normalize()` 包装
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│   @lionad/cx-render（渲染器）                                         │
│   `packages/renderer/src/cmpts/render.vue`              （CxRender）  │
│   `packages/renderer/src/cmpts/render-component.vue`    （递归）      │
│   `packages/renderer/src/cmpts/render-components.vue`   （插槽集合）  │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ 通过 inject('cx') 持有 CxLoader
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│   @lionad/cx-vue（Vue 运行时 composables）                            │
│   `packages/vue/src/hooks/*`、`packages/vue/src/components/*`        │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│   @lionad/cx-definition（schema 与 loader 核心）                      │
│   `packages/definition/src/loader/index.ts`       （CxLoader）        │
│   `packages/definition/src/normalize/component.ts`（normalize）       │
│   `packages/definition/src/events/*`、`packages/definition/src/types/*` │
└─────────────────────────────────────────────────────────────────────┘
```

依赖链（单向，从下往上读）：

```text
definition ──▶ vue ──▶ renderer ──▶ components ──▶ components-nuxt-ui-v4 ──▶ nuxt
```

- `@lionad/cx-definition`：最底层、零 Vue 渲染依赖（仅 peer dep vue / `@vueuse/core`），定义 `CxLoader`、`normalize`、事件总线、`CxComponentRuntime` 类型系统。
- `@lionad/cx-vue`：Vue 端 composables 与共享运行时组件（BEM、slots、props-styles、request、media 等）。
- `@lionad/cx-render`：消费 schema、递归调用 Vue `<component :is>`。
- `@lionad/cx-components`：cx 自研基础物料（block / text / header / grid / calendar / page / user-style）。
- `@lionad/cx-components-nuxt-ui-v4`：vendored Nuxt UI v2 物料，配合离线 shim，脱离 Nuxt 运行时也可打包。
- `@lionad/cx-nuxt`：Nuxt 模块入口，把上述所有能力零配置注入宿主。

## 组件职责

| 组件 | 职责 | 文件 |
|------|------|------|
| `CxLoader` | 物料注册中心、事件总线、refs / utils / datas 持有者，整个系统的运行时单例 | `packages/definition/src/loader/index.ts` |
| `normalize` | 把 Vue SFC + 元信息描述符转换为带 `_cx_meta` / `_cx_install` 的标准化组件 | `packages/definition/src/normalize/component.ts` |
| `createCxEmitter` | mitt 风格事件广播器，按 `CxSubEvent.target` 路由到目标组件 ref | `packages/definition/src/events/cx-emitter.ts` |
| `createCxUtils` | 物料查找、运行时名称计算、树操作等工具集（`metadataUtils` + `runtimeUtils`） | `packages/definition/src/utils/index.ts`、`packages/definition/src/utils/metadata.ts`、`packages/definition/src/utils/runtime.ts` |
| `CxRender` | 顶层渲染组件；提供上下文（`cx` / `is-cx-edit` / `cx-render-parent` 等）并挂 `Suspense` | `packages/renderer/src/cmpts/render.vue` |
| `CxRenderComponent` | 单节点渲染器；解析 `cmpt.key` 为 Vue 组件、合并 `data` / `events` / `slots` | `packages/renderer/src/cmpts/render-component.vue` |
| `CxRenderComponents` | 插槽集合渲染器；按 `slot.key` 拉子组件并递归 | `packages/renderer/src/cmpts/render-components.vue` |
| `CxRenderComponentWithBindings` | 把 cx-styles（margin/padding/border/font/round/cosom/breakpoint）与指令绑到具体组件上 | `packages/renderer/src/cmpts/render-component-with-bindings.vue` |
| Nuxt module | `defineNuxtModule` 入口；注册 `CxRender`、注入 server/client plugin | `packages/nuxt/src/module.ts` |
| `installCxBundles` | 按选项 `materials: ['render','components','nuxt-ui']` 安装物料集 | `packages/nuxt/src/runtime/install.ts` |
| Vendored shim | 离线化 Nuxt 虚拟模块（`#imports` / `#app` / `useState` / `useId`） | `packages/components-nuxt-ui-v4/vendor/shims/imports.ts` |

## 模式概览

**整体模式：** Schema 驱动的递归渲染 + 依赖注入（provide/inject）+ Loader 即运行时中枢。

**关键特征：**

- **单一运行时中枢**：`CxLoader` 实例同时持有 `installed` 组件注册表、`refs`（id → 组件实例）、`emitter`（事件总线）、`utils`（查找/树操作）、`datas`（响应式状态），一切运行时能力都从它派生。
- **Provider 传播**：`CxRender` 通过 `provide('cx', cx)`、`provide('cx-render-parent', $parentEl)` 等把上下文下发给递归子节点，避免 prop drilling。
- **物料即插件**：所有物料经 `normalize()` 后既是 Vue 插件（带 `_cx_install`）又是带元数据的组件；`CxLoader.installComponent` 统一注册到 `app.component(key, ...)`。
- **递归渲染**：`render-component` ↔ `render-components`（复数）互相调用遍历 `CxComponentRuntime.components` 树。
- **Vite+ 单工具链**：构建、测试、lint、fmt、pack 全部从根 `vite.config.ts` 出口。

## 分层

### definition 层（`packages/definition/src/`）

- **职责：** 类型系统、`normalize`、`CxLoader`、事件总线、运行时工具。
- **位置：** `packages/definition/src/`
- **包含：**
  - `loader/`（`CxLoader` 类、远程物料 script-manager、UMD/ESM 模块获取、`getDefaultExportFromModule`）
  - `normalize/`（`component.ts` 的 `normalize()`、`meta.ts` 默认元信息、`shared.ts`）
  - `events/`（`cx-emitter.ts` 广播器、`cx-loader.ts` 钩子、`i18n.ts` 翻译器）
  - `hooks/`（`use-t` i18n composable）
  - `types/`（`defined/` 静态类型、`runtime/` 运行时类型、`helper/`）
  - `utils/`（树操作、refs、metadata/runtime utils、schedule、guard）
  - `configs/`（pkg 元信息）、`helper/`（`prefix` 工具）、`guards.ts`（类型守卫）
- **依赖：** 仅 Vue peer dep + `@vueuse/core` + 第三方工具（`lodash-es`、`mitt`、`zod`、`nanoid`、`nativebird`、`bignumber.js`、`kareem`、`uuid`、`type-fest`）。
- **被使用：** 上层所有包都直接或间接依赖。

### vue 层（`packages/vue/src/`）

- **职责：** 与 Vue 强耦合的 composables、共享运行时组件、BEM、DOM 工具。
- **位置：** `packages/vue/src/`
- **包含：**
  - `hooks/`（`use-cx-props`、`use-cx-slot`、`use-cx-responsive`、`use-cx-styles`、`use-cx-states`、`use-cx-panel`、`use-cx-edit-mode`、`use-cx-media`、`use-request`、`use-task`、`use-scoped-css`、`use-cx-interval-fn`、`use-cx-min-time`、`use-cx-re-render` 等）
  - `components/`（`CxIcon`、`CxEmpty`、`CxEmptyImage`、`CxActions`）
  - `vue/`（DOM、slots、mark-raw、fake-touch、life-cycle、time、sizes、safe-icon、key-stroke、use-sort、use-table、clone 等）
  - `bem/`（BEM 命名空间生成）
- **依赖：** `@lionad/cx-definition`、`@iconify/vue`、`dayjs`、`anysort`、`vue-concurrency`。
- **被使用：** renderer 与所有物料包。

### renderer 层（`packages/renderer/src/`）

- **职责：** 把 `CxComponentRuntime[]` 渲染成 Vue 组件树，处理插槽嵌套、cx-styles 绑定、断点响应。
- **位置：** `packages/renderer/src/`
- **包含：** `cmpts/`（5 个渲染器组件 + `info.vue`）、`event/native-event.ts`（原生事件清单）、`styles/index.scss`（`@layer cx`）、`utils/`（`deepMerge`）、`shims.d.ts`（样式副作用声明）。
- **依赖：** `@lionad/cx-definition`、`@lionad/cx-vue`、`sass-embedded`。
- **被使用：** components、components-nuxt-ui-v4、nuxt；并通过 `CxRenderCmpts`（`packages/renderer/src/cmpts/index.ts`）作为可被安装的物料集合。

### components 层（`packages/components/src/`）

- **职责：** 自研基础物料。
- **位置：** `packages/components/src/`
- **包含：** `basic/`（block、figure、header、h1~h5、p、logic、datas、text）、`grid/`、`calendar/`、`page/`、`user-style/`、`styles/`。
- **依赖：** `@lionad/cx-definition`、`@lionad/cx-render`、`@lionad/cx-vue`、`dayjs`、`zod`。
- **被使用：** 由 `@lionad/cx-nuxt` 的 `installCxBundles` 装配；playground 首页用作渲染验收。

### components-nuxt-ui-v4 层（`packages/components-nuxt-ui-v4/src/`）

- **职责：** 基于 vendored Nuxt UI v2 的物料库（40+ 组件：button、input、card、modal、table、form 等）。
- **位置：** `packages/components-nuxt-ui-v4/src/`
- **包含：**
  - `nuxt-ui-2/<comp>/`（每个物料：`index.ts` 出 `normalize()`，`src/index.vue` 实现，`panel/` 编辑器配置，`slots/`、`types/`、`utils/` 视需要）
  - `simple-card/`（独立简单卡片物料）
  - `styles/`、`shims.d.ts`
  - `vendor/`：vendored Nuxt UI v2 源码 + 离线 shim（`shims/imports.ts`、`shims/app.config.ts`、`shims/ui-colors.d.ts`、`shims/nuxt-schema.d.ts`）
- **依赖：** `@lionad/cx-definition`、`@lionad/cx-vue`、`@headlessui/vue`、`@popperjs/core`、`@vueuse/integrations`、`fuse.js`、`ohash`、`tailwind-merge`、`v-calendar`、`vue-demi`、`defu`。
- **特殊：** 通过 `vendor/shims/` 在脱离 Nuxt 时仍可独立打包测试；在真实 Nuxt 宿主里则由 Nuxt 解析虚拟模块。

### nuxt 层（`packages/nuxt/src/`）

- **职责：** Nuxt 模块入口，零配置集成。
- **位置：** `packages/nuxt/src/`
- **包含：**
  - `module.ts`（`defineNuxtModule`，注册 `CxRender`、注入样式、声明 `runtimeConfig.public.cx.materials`）
  - `runtime/install.ts`（`installCxBundles`：按 `materials` 选项装配 bundles）
  - `runtime/plugin.server.ts`（仅装本地物料，支持 SSR）
  - `runtime/plugin.client.ts`（额外 `cx.init(window.location.href, {app})` 拉远程 metadata）
- **依赖：** 所有下游 cx 包 + `@nuxt/kit` / `@nuxt/schema` / `nuxt`。

## 数据流

### 主渲染路径（Schema → Vue 树）

1. 宿主启动时实例化 `CxLoader`：`packages/nuxt/src/runtime/plugin.client.ts:14` 的 `new CxLoader()` + `cx.init(url, {app})`。
2. `CxLoader.load()` → `loadMetadata()` → `installComponentsFromMetadata()` 拉远程物料 UMD/ESM 模块（`packages/definition/src/loader/index.ts`），并经 `installComponent` 注册到 `app.component()`。
3. 本地物料 bundle 由 `installCxBundles` 注入（`packages/nuxt/src/runtime/install.ts`）。
4. 业务侧（如 `playground/app/pages/index.vue`）构造 `CxComponentRuntime[]` 树，作为 `:components` prop 传给 `CxRender`。
5. `CxRender`（`packages/renderer/src/cmpts/render.vue`）挂 `Suspense`，`provide('cx', cx)`，把首个组件交给 `CxRenderComponent`。
6. `CxRenderComponent`（`packages/renderer/src/cmpts/render-component.vue`）按 `cmpt.key` 经 `resolveComponent` 拿到 Vue 组件，合并 `cmpt.data` → props、`cmpt.emits` → 事件、`cmpt.slots` → 插槽，再包一层 `CxRenderComponentWithBindings`（指令 + cx-styles）。
7. 每个插槽由 `CxRenderComponents`（复数）渲染：拉对应 `cmpt.components[slot.key]` 子数组并递归回第 5 步。

### 事件流（组件 → 组件）

1. 业务组件在模板里 `v-on="genEvtsFromCxMetaEmits"`（约定见 `use-cx-slot`），抛出原生 Vue 事件。
2. `CxRenderComponent` 的 `cmptEvents` 监听器捕获，经 `cxEmitter` 把 `CxSubEvent` 派发到 `refs.get(event.target).ref` 上调用对应方法（`packages/definition/src/events/cx-emitter.ts`）。
3. `target: '*'` 时广播到所有 refs。

### SSR 与 CSR 分流

- **server plugin**（`packages/nuxt/src/runtime/plugin.server.ts`）：不调 `cx.init(url, ...)`，避免在 Node 上下文触网；只装本地 bundle，支持 SSR 渲染。
- **client plugin**（`packages/nuxt/src/runtime/plugin.client.ts`）：调 `cx.init(window.location.href, {app})` 触发远程 metadata 拉取（与 p-ray 编辑器同形）。
- **playground**：`ssr: false`（`playground/nuxt.config.ts:6`），整个站会模块仅在客户端运行。

**状态管理：** 无 Pinia/Vuex。CxLoader 自身维护 `installed`（注册表）、`refs`（`RefsManager` 按 id 存实例）、`datas`（响应式状态，含 `cmpts` / `root`）、`emitter`。playground 站会模块有自有的 `states/` 目录（pinia-like 风格的 plain composable stores：`standup.ts`、`standups.ts`、`project.ts`、`users.ts`、`issues.ts`、`issue-filter.ts`、`project-last-selected.ts`）。

## 关键抽象

### `CxComponentRuntime`（运行时 schema 节点）

- **用途：** 描述界面中某个具体组件实例——它在树里的位置、显示数据、子节点。
- **定义：** `packages/definition/src/types/runtime/cx-component.ts`
- **关键字段：** `id`、`key`（对应 Vue 组件名）、`name`、`aliasKeys`、`data`（含 `_cx_name` / `_cx_events` / `_cx_style` / `_cx_data_config` 等带前缀的 cx 元字段）、`props` / `emits` / `exposes`（元信息快照）、`parents`（父 id 列表）、`components`（slot key → 子节点数组，构成递归树）。

### `normalize()`（物料声明 API）

- **用途：** 业务方声明一个物料的唯一入口。返回值就是带 `_cx_meta` / `_cx_install` 的 Vue 组件本体。
- **位置：** `packages/definition/src/normalize/component.ts`
- **必填字段：** `name`（中文名）、`key`（kebab-case 全局唯一）、`icon`（`i-tabler-*` 等 Iconify 名）、`description`、`component`（Vue SFC）。
- **可选字段：** `props`（右侧编辑器表单 schema）、`emits`、`exposes`、`slots`（可函数，根据 `cmpt.data` 动态算）、`async`、`aliasKeys`、`url`、`type`、`rules`。
- **使用例：** `packages/components/src/grid/index.ts`、`packages/components-nuxt-ui-v4/src/nuxt-ui-2/button/index.ts`、`packages/components-nuxt-ui-v4/src/simple-card/index.ts`。

### `CxLoader`（运行时中枢）

- **用途：** 物料注册中心 + 事件分发 + 实例引用仓库 + 工具集工厂。
- **位置：** `packages/definition/src/loader/index.ts`
- **核心 API：** `init(url, config, cb)`、`load()`、`loadMetadata()`、`installComponent(key, cmpt)`、`installComponents(cmpt)`、`getClone()`（用于嵌套 cx-render）。
- **挂载属性：** `hooks`（loader 钩子，`readonly`）、`utils`（`createCxUtils` 工厂产出，`readonly`）、`refs`（`RefsManager`）、`emitter`（mitt 风格）、`datas`（`createCxDatas`，包含 `root` / `cmpts` / `renderCmptList`）、`installed` / `installedAsync` / `installedComponents`、`metadata`。

### `CxRenderCmpts`（渲染器物料集）

- **用途：** 把 `CxRender`、`CxRenderComponent`、`CxInfo` 等本身作为物料暴露给编辑器，方便 p-ray 在画布里嵌套使用。
- **位置：** `packages/renderer/src/cmpts/index.ts`

### `CxMaterialBundle`（物料集开关）

- **用途：** Nuxt 模块选项 `materials: ('render' | 'components' | 'nuxt-ui')[]`，按需装配。
- **定义：** `packages/nuxt/src/module.ts`

## 入口点

### 库入口（每个包的 `src/index.ts`）

- `packages/definition/src/index.ts`：聚合 `configs` / `events` / `helper` / `normalize` / `hooks` / `loader` / `utils` / `types` / `guards`，并保留 `default` 聚合对象做 legacy 兼容。
- `packages/vue/src/index.ts`：聚合 `hooks` / `bem` / `vue/*` / `components`。
- `packages/renderer/src/index.ts`：导出 `CxRender`、`CxRenderCmpts`，引入 `styles/index.scss`。
- `packages/components/src/index.ts`：导出 `CxBasics` / `CxGrid` / `CxCalendar` / `CxPage` / `CxUserStyle`。
- `packages/components-nuxt-ui-v4/src/index.ts`：导出 `CxNuxtUI`（40+ 物料数组）+ `CxSimpleCard`。
- `packages/nuxt/src/module.ts`：`defineNuxtModule` 默认导出。

### 应用入口

- `playground/nuxt.config.ts`：注册 `@lionad/cx-nuxt` 模块，`ssr: false`，挂 element-plus 与 standup 样式。
- `playground/app/app.vue`：Nuxt 根。
- `playground/app/pages/index.vue`：首页，演示三种用法——schema 驱动渲染（基础物料、迁移物料）+ 站会模块入口。
- `playground/app/plugins/standup-materials.ts`：站会物料装配示例，把 `~/standup/components` 里所有带 `_cx_meta` 的物料注册到 `nuxtApp.$cx`。

## 架构约束

- **Vue 单例（hard alias）：** `vite.config.ts` 把 `vue` 强制 alias 到唯一物理副本（`node_modules/.pnpm/vue@3.5.26_typescript@7.0.2/node_modules/vue`），否则 pnpm 多 peer 副本会让 `EMPTY_OBJ` 单例身份分裂、`useTemplateRef` 崩溃。**新增依赖若也声明 vue peer，需保证不绕过该 alias。**
- **Nuxt 虚拟模块离线化：** `vite.config.ts` 与 `packages/components-nuxt-ui-v4/tsconfig.json`、`packages/components-nuxt-ui-v4/vite.config.ts` 共同把 `#app` / `#imports` / `#build/app.config` / `#ui-colors` / `nuxt/schema` alias 到 `packages/components-nuxt-ui-v4/vendor/shims/*`。**禁止把 shim 路径改成"真实 Nuxt"** —— 这是 vendored 物料脱离 Nuxt 运行时打包的必要条件。
- **远程物料信任边界：** `packages/definition/src/loader/script-manager.ts` 从任意 URL 拉取 JS 并在页面上下文执行（ESM：`fetch + <script>` 内联；UMD：`<script src>`）。**当前不强制 HTTPS、不校验 SRI、不维护 allowlist**，消费方必须自行以 CSP 等方式缓解（详见 `packages/definition/README.md`）。
- **Suspense 不能移除：** `packages/renderer/src/cmpts/render.vue` 模板顶层是 `<Suspense>`，依赖断点宽度（来自 `$cxRenderParent`），去掉会让 parent 变成 Fragment 导致断点计算失败。
- **markRaw 不可省略：** 所有进入 `CxLoader.installed` 的组件都经 `hmrFreeFreezing`（`markRaw` + 非开发模式 `Object.freeze`）防止 Vue 把组件当作响应式对象代理。
- **远程物料仅客户端：** server plugin 不调 `cx.init(url, ...)`；任何带"网络请求 / window 访问"的物料初始化必须限定在 client plugin 或 `import.meta.client` 分支。
- **CSS 分层：** 渲染器样式位于 `@layer cx`（`packages/renderer/src/cmpts/render.vue`、`packages/renderer/src/styles/index.scss`），保证不与宿主样式打架。
- **TypeScript 严格：** `tsconfig.base.json` 开启 `strict`、`noUncheckedIndexedAccess`、`verbatimModuleSyntax`、`noEmit`。子包 tsconfig 仅追加 `rootDir` / `types` / `paths`。
- **零运行时圆形依赖：** 包间依赖严格单向（见依赖链）。`CxRender` ↔ `CxRenderComponent` 在同一包内互相引用是 Vue SFC 编译期模板解析，不是循环 import。

## 反模式

### 直接给 Vue 组件手工挂 `_cx_meta`

**错误做法：** 跳过 `normalize()`，手写 `MyComponent._cx_meta = {...}`。
**为什么错：** `_cx_install`（Vue 插件安装函数）和默认元信息合并由 `withDefaultMeta` 完成；手工挂载会缺字段、丢类型推断、无法走 `app.component(key, ...)` 注册链。
**正确做法：** 一律走 `normalize({ name, key, icon, description, component, props, ... })`（参考 `packages/components/src/basic/index.ts`）。

### 在 SSR 上下文触发远程 metadata 拉取

**错误做法：** 在 server plugin / 顶层 setup 调 `cx.init(url, {app})` 或 `await cx.loadMetadata()`。
**为什么错：** `script-manager.ts` 大量使用 `document.head`、`window` 等浏览器 API，Node 端会崩溃；且服务端无网络隔离会引入未预期外呼。
**正确做法：** 仿照 `packages/nuxt/src/runtime/plugin.server.ts` 只装本地 bundle；远程初始化仅放 `plugin.client.ts`。

### 把 `vendor/shims/` 当作真实 Nuxt 实现

**错误做法：** 在真实 Nuxt 宿主里保留 `#imports` → `vendor/shims/imports.ts` 的 alias。
**为什么错：** shim 里的 `useId` / `useState` / `useAppConfig` 是离线降级实现（模块级 Map、进程内递增 id、空 `useHead`），不具备 SSR 跨端一致性、head 注入、appConfig 合并等 Nuxt 语义。
**正确做法：** 真实 Nuxt 宿主由 Nuxt 自身解析虚拟模块；只在 `@lionad/cx-components-nuxt-ui-v4` 独立打包测试或非 Nuxt 消费时使用 shim。

### 手动构造 `CxComponentRuntime` 时遗漏 `_cx_meta` / `parents`

**错误做法：** 业务侧构造 schema 节点时省略 `parents`、`emits`、`exposes`、`props`、`components`。
**为什么错：** 渲染器与运行时工具（如 `cx.utils.getParent`、`cxEmitter` 的 target 路由）依赖这些字段存在。
**正确做法：** 参照 `playground/app/pages/index.vue` 的 demo 节点结构，至少给出 `id`、`key`、`name`、`aliasKeys`、`data`、`props`、`emits`、`exposes`、`parents`、`components`。

### 移除 `CxRender` 的 `Suspense` 或 `renderKey`

**错误做法：** 把 `<Suspense>` 改成 `<template>` 或删除 `renderKey` ref。
**为什么错：** 断点样式依赖 `$cxRenderParent.parentElement` 拿容器宽度；翻译切换（`cxTranslateFn`）依赖 `renderKey` 自增触发重渲染。
**正确做法：** 保留 `Suspense` + `renderKey`（见 `packages/renderer/src/cmpts/render.vue`）。

## 错误处理

**策略：** 容错优先，渲染器尽量避免抛错冒泡到 Vue 根。

**模式：**

- 异步物料失败：`defineAsyncComponent` 配 `errorComponent: () => h('div', {}, 'Error on ${meta.key}')`（`packages/definition/src/loader/index.ts`）。
- 单组件渲染失败：`CxRenderComponent` 用 `onErrorCaptured` + `showCmptErrorWrapper` 切换为错误态包装组件（`packages/renderer/src/cmpts/render-component.vue`）。
- 物料注册失败：`installComponentsFromMetadata` 用 `console.group()` 记录上下文但不中断其他物料安装。
- 事件总线校验：`isValidEvent` / `isValidSubEvent` 在派发前校验结构，非法事件仅 `console.log` 不抛错（`packages/definition/src/events/cx-emitter.ts`）。
- playground 测试隔离：`playground/tests/setup.ts` 用 `vi.stubGlobal('fetch', ...)` 把 standup 域模块级预热请求兜底成固定成功响应，避免 unhandled rejection。

## 横切关注点

**国际化（i18n）：**

- 翻译器在 `packages/definition/src/events/i18n.ts`，通过 `cxTranslateFn` / `cxTranslator` 暴露。
- `use-t` composable 在 `packages/definition/src/hooks/use-t/index.ts`。
- `CxRender` watchEffect 监听 `cxTranslateFn.value` 变化触发重渲染（`packages/renderer/src/cmpts/render.vue`）。

**断点（响应式）：**

- `useCxBreakpointType`（`packages/vue/src/hooks/use-cx-props/use-cx-styles/`）以 `cxRenderParent` 宽度为来源；`CxRenderComponentWithBindings` 缓存按 `cxRenderRef` 复用 hook 实例（`packages/renderer/src/cmpts/render-component-with-bindings.vue`）。

**样式注入：**

- Nuxt 模块选项 `injectStyles: true`（默认）会 push `@lionad/cx-render/style` 与 `v-calendar/dist/style.css` 到 `nuxt.options.css`（`packages/nuxt/src/module.ts`）。
- 物料样式位于 `@layer cx` 与 `packages/components-nuxt-ui-v4/src/styles/`。

**日志：** 全仓使用裸 `console.log` / `console.info` / `console.error` / `console.group`，无统一 logger；调试日志以 `[info]` / `[debug]` / `[ERR]` 前缀区分。

**校验：** `zod` 用于部分表单 schema（`packages/components/src/basic/index.ts`、`packages/components-nuxt-ui-v4`）。

**类型检查：** 根脚本 `pnpm typecheck` 跑各包 `vue-tsgo --noEmit`；playground 用 `nuxi prepare && vue-tsc --noEmit`。

**构建：** `vp pack`（基于 tsdown / rolldown 的 `vite-plus` pack）作为库构建；`packages/nuxt` 用 `nuxt-module-build`。

*架构分析：2026-07-20*
