# 代码库结构（Codebase Structure）

**分析日期：** 2026-07-20

## 目录布局

```text
cx/
├── packages/                       # 11 个子包，单向依赖链
│   ├── definition/                 # schema 与 loader 核心（底层）
│   ├── vue/                        # Vue 运行时 composables 与共享组件
│   ├── renderer/                   # 渲染器（递归 schema → Vue 树）
│   ├── stream/                     # 流式结构化渲染管线（cx-stream，物料包侧依赖）
│   ├── comps/                      # 自研基础物料（block / text / grid …）
│   ├── comps-nuxt-ui-v2/           # Nuxt UI v2 物料库
│   ├── comps-nuxt-ui-v4/           # vendored Nuxt UI v2 物料库
│   │   └── vendor/                 # vendored 第三方源码 + 离线 shim（不参与 lint/fmt）
│   ├── comps-vtu/                  # tool-ui-vue（vtu）工具调用组件物料库
│   ├── comps-element-plus/         # Element Plus 组件物料库（schema 驱动包装）
│   ├── comps-naive-ui/             # Naive UI 组件物料库（schema 驱动包装，CSS-in-JS 零 css 装配）
│   ├── eslint/                     # 共享 lint 配置
│   └── nuxt/                       # Nuxt 模块入口（顶层）
├── playground/                     # 开发沙箱 + EAP 站会迁移 demo
│   ├── app/                        # Nuxt app 目录（页面、插件、standup 业务）
│   ├── server/                     # Nitro server routes（mock API）
│   ├── mocks/                      # mock 种子数据（gen:mocks 生成）
│   ├── scripts/                    # 数据生成脚本
│   ├── tests/                      # 端到端验收 / 契约测试
│   └── nuxt.config.ts              # playground 配置（ssr:false、端口 3209）
├── vite.config.ts                  # 根 Vite+ 配置（vue 单例 alias + Nuxt 虚拟模块 shim）
├── tsconfig.base.json              # 严格 TS 基线（strict + noUncheckedIndexedAccess + verbatimModuleSyntax）
├── pnpm-workspace.yaml             # 工作区：packages/* 与 playground；含 overrides（vite/vitest/vue）
├── package.json                    # 根 package（devDeps：vite-plus、vitest、vue-tsgo）
├── Agents.md                       # 项目说明书（Claude.md 是其符号链接）
└── .planning/codebase/             # 本批分析文档输出位置
```

## 各目录用途

### `packages/definition/`

- **用途：** 整个系统的核心——`CxLoader`、`normalize()`、事件总线、类型系统。
- **包含：** `src/loader/`、`src/normalize/`、`src/events/`、`src/hooks/`、`src/types/`、`src/utils/`、`src/configs/`、`src/helper/`、`src/reference/`（budibase 参考样例）；`tests/`（normalize 与 runtime-algorithms 测试）；`dist/` 产物。
- **关键文件：** `src/loader/index.ts`（CxLoader 类）、`src/normalize/component.ts`（normalize API）、`src/types/runtime/cx-component.ts`（CxComponentRuntime）、`src/events/cx-emitter.ts`（事件总线）。

### `packages/vue/`

- **用途：** Vue 端共享运行时——composables、BEM、DOM 工具、共享组件。
- **包含：** `src/hooks/`（每个 composable 一个目录，含 `index.ts`）、`src/components/`（4 个共享组件 + `index.ts`）、`src/vue/`（DOM/slots/mark-raw/time/sizes 等工具）、`src/bem/`；`tests/use-request.test.ts`。
- **关键文件：** `src/hooks/index.ts`（聚合出口，含 `useCx` / `useCX`）、`src/hooks/use-cx-props/index.ts`（cx-styles 系列）、`src/hooks/use-cx-slot/index.ts`（插槽显隐判断）。

### `packages/renderer/`

- **用途：** 渲染器组件（5 个 SFC + 一个透明包装器）。
- **包含：** `src/comps/`（`render.vue`、`render-component.vue`、`render-component-with-bindings.vue`、`render-components.vue`、`transparent-render.vue`、`info.vue`、`index.ts`）、`src/event/`（事件兼容转发 + `native-event.ts`）、`src/styles/`、`src/utils/`、`src/shims.d.ts`。
- **关键文件：** `src/comps/render.vue`（CxRender 顶层）、`src/comps/index.ts`（CxRenderComps 物料集）。

### `packages/comps/`

- **用途：** 自研基础物料。
- **包含：** `src/basic/`（block / figure / header / h1~h5 / p / logic / datas / text）、`src/grid/`（含 `config/` `panel/` `utils/`）、`src/calendar/`（含 `panel/` `src/ui/`）、`src/page/`、`src/user-style/`、`src/styles/`、`src/index.ts`；`tests/materials.test.ts`（物料 smoke）。
- **关键文件：** `src/basic/index.ts`（聚合 11 个基础物料，演示 `normalize()` 用法）、`src/grid/index.ts`（动态 slots 计算 demo）。

### `packages/comps-nuxt-ui-v4/`

- **用途：** 基于 vendored Nuxt UI v2 的物料库 + 离线 shim。
- **包含：**
  - `src/nuxt-ui-2/<comp>/`：40+ 物料目录，每个含 `index.ts`（`normalize` 出口）、`src/index.vue`，按需带 `panel/`、`slots/`、`types/`、`utils/`。
  - `src/simple-card/`：独立物料。
  - `src/styles/`、`src/shims.d.ts`。
  - `vendor/`：vendored Nuxt UI v2 源码 + shim（`shims/imports.ts`、`shims/app.config.ts`、`shims/ui-colors.d.ts`、`shims/nuxt-schema.d.ts`）、`vendor/src/runtime/`（原版组件源码）。
  - `tests/materials.test.ts`。
- **关键文件：** `src/nuxt-ui-2/index.ts`（聚合 40+ 物料默认导出）、`vendor/shims/imports.ts`（离线 Nuxt 替身）。

### `packages/comps-element-plus/`

- **用途：** 包装 Element Plus 组件为 cx 物料（六类 27 件冻结），对齐 vtu 的纯 npm 库包装范式。
- **包含：** 每物料 `<comp>/index.ts` + `<comp>/src/index.vue`；`shared/use-ep-props.ts`（attrs 桥接）；`table/stream-trigger.ts` + `stream-triggers.ts`（流式增量预设）；`tests/`（桥接单测 + 各类 smoke + 27 件契约冻结）。
- **关键文件：** `src/index.ts`（`CxElementPlus` 数组 + `CxElementPlusBundle` + `export * from './stream-triggers'`）、`src/shared/use-ep-props.ts`、`README.md`（含宿主侧 `layer(cx-ep)` 样式契约）。

### `packages/comps-naive-ui/`

- **用途：** 包装 Naive UI 组件为 cx 物料（六类 27 件冻结），对齐 EP/vtu 的纯 npm 库包装范式；naive-ui 为 CSS-in-JS，无 css 装配契约。
- **包含：** 每物料 `<comp>/index.ts` + `<comp>/src/index.vue`；`shared/use-naive-ui-props.ts`（attrs 桥接）+ `shared/use-naive-change-bridge.ts`（桥接族变更上行）；`data-table/stream-trigger.ts` + `stream-triggers.ts`（流式增量预设）；`tests/`（桥接单测 + 各类 smoke + 27 件契约冻结）。
- **关键文件：** `src/index.ts`（`CxNaiveUi` 数组 + `CxNaiveUiBundle` + stream-triggers 具名导出）、`src/shared/use-naive-change-bridge.ts`、`README.md`（CSS-in-JS 零装配契约 + 组件清单 + 未收录清单）。

### `packages/nuxt/`

- **用途：** Nuxt 模块入口，零配置集成。
- **包含：** `src/module.ts`（`defineNuxtModule`）、`src/runtime/install.ts`、`src/runtime/plugin.server.ts`、`src/runtime/plugin.client.ts`；`dist/` 产物。
- **关键文件：** `src/module.ts`（`bundles` / `materials` 选项与 `#build/cx-bundles.mjs` 虚拟模块生成）、`src/runtime/install.ts`（installCxBundles 装配逻辑）。

### `playground/`

- **用途：** cx 能力验收环境 + EAP 站会管理迁移 demo（一等公民）。
- **包含：**
  - `app/`：Nuxt app 目录
    - `app.vue`、`app.config.ts`
    - `pages/`：`index.vue` + `standup/`（`list.vue` + `dashboard/daily.vue` + `dashboard/weekly.vue`）
    - `plugins/`：`element-plus.ts`、`iconfont.client.ts`、`standup-materials.ts`、`standup.ts`
    - `standup/`：业务模块（`apis/`、`components/`、`hooks/`、`states/`、`styles/`、`utils/`、`views/`、`assets/`）
  - `server/api/`：Nitro 路由（standup / issues / project / user / users / labels / gitlab-projects / avatar），全部 POST + 包络 `{code, message, success, data}`
  - `mocks/data/`：种子 JSON（脚本生成，以当日为锚，同日幂等）
  - `scripts/generate-mocks.mjs`：mock 数据生成器
  - `tests/`：契约 / smoke / server 写路由 / 工具函数测试 + `setup.ts`
  - `global.d.ts`、`modules.d.ts`：Nitro 自动导入与 Nuxt 虚拟模块类型声明
- **关键文件：** `nuxt.config.ts`（ssr:false + cx 模块注册）、`app/pages/index.vue`（首页，三种渲染 demo）、`app/plugins/standup-materials.ts`（业务物料装配示例）。

### `.planning/codebase/`

- **用途：** GSD 工具链（`/gsd:map-codebase` 等）产出的代码库分析文档（即本目录）。
- **生成：** 是；由 GSD agent 写入，人工不直接编辑。
- **提交：** 是（与 `.planning/` 其他子目录同进同出）。

## 关键文件位置

**入口点：**

- `packages/definition/src/index.ts`：definition 库入口（聚合所有子模块）。
- `packages/vue/src/index.ts`：vue 库入口。
- `packages/renderer/src/index.ts`：renderer 库入口（含样式副作用 `import './styles/index.scss'`）。
- `packages/comps/src/index.ts`：components 库入口。
- `packages/comps-nuxt-ui-v4/src/index.ts`：nuxt-ui 物料库入口。
- `packages/comps-element-plus/src/index.ts`：Element Plus 物料库入口（含 stream-triggers 再导出）。
- `packages/comps-naive-ui/src/index.ts`：Naive UI 物料库入口（含 stream-triggers 具名导出）。
- `packages/stream/src/index.ts`：cx-stream 管线入口。
- `packages/nuxt/src/module.ts`：Nuxt 模块入口。
- `playground/nuxt.config.ts`：playground 应用入口。
- `playground/app/app.vue`：playground Nuxt 根组件。

**配置：**

- `vite.config.ts`：根 Vite+ 配置（vue 单例 alias、Nuxt 虚拟模块 shim、vitest include/exclude、lint/fmt 忽略）。
- `tsconfig.base.json`：TS 严格基线，所有子包 extends 它。
- `pnpm-workspace.yaml`：工作区声明 + overrides（vite / vitest / vue）。
- `packages/*/tsconfig.json`：子包 TS 配置（仅追加 `rootDir` / `types` / `paths`）。
- `packages/*/vite.config.ts`：子包 `vp pack` 配置（neverBundle 列表）。
- `packages/comps-nuxt-ui-v4/tsconfig.json` 与 `vite.config.ts`：含 Nuxt 虚拟模块 paths/alias。
- `playground/nuxt.config.ts`：ssr:false、模块注册、css、devServer。

**核心逻辑：**

- `packages/definition/src/loader/index.ts`：CxLoader 主体。
- `packages/definition/src/normalize/component.ts`：normalize API。
- `packages/definition/src/events/cx-emitter.ts`：事件总线。
- `packages/renderer/src/comps/render.vue`：CxRender 顶层渲染。
- `packages/renderer/src/comps/render-component.vue`：递归渲染单节点。
- `packages/nuxt/src/module.ts` 与 `packages/nuxt/src/runtime/install.ts`：物料装配。

**测试：**

- `packages/definition/tests/normalize.test.ts`、`runtime-algorithms.test.ts`
- `packages/vue/tests/use-request.test.ts`
- `packages/comps/tests/materials.test.ts`
- `packages/comps-nuxt-ui-v4/tests/materials.test.ts`
- `playground/tests/`：`mock-contract.test.ts`、`materials-smoke.test.ts`、`server-write-routes.test.ts`、`cyber-envelope.test.ts`、`utils-*.test.ts`、`setup.ts`
- 测试运行入口：根 `pnpm test` → `vp test`；类型检查 `pnpm typecheck`。

## 命名规范

**包名（package.json `name`）：** 全部以 `@lionad/cx-` 为 scope 前缀。

- `@lionad/cx-definition`、`@lionad/cx-vue`、`@lionad/cx-render`、`@lionad/cx-comps`、`@lionad/cx-comps-nuxt-ui-v4`、`@lionad/cx-nuxt`。
- `cx-playground`（playground 私有，不带 scope）。

**文件：**

- **SFC**：lowercase-kebab，业务文件以 `index.vue` 为主名（`packages/comps/src/grid/src/index.vue`、`packages/comps-nuxt-ui-v4/src/nuxt-ui-2/button/src/index.vue`）；编辑器表单类放 `panel/*.vue`（如 `grid/panel/grids-form.vue`、`card-tabs/panel/tabs.vue`）。
- **TS 模块**：`index.ts` 作为桶文件；按职责命名（`cx-emitter.ts`、`script-manager.ts`、`native-event.ts`、`use-request.ts`）。
- **目录**：lowercase-kebab；每个物料/概念一个目录（`button/`、`accordion/`、`use-cx-slot/`）。
- **Vue 组件名**：组件内 `defineOptions({ name: 'CxRender' })` 以 `Cx` 前缀大驼峰；物料 `key` 字段是 `cx-<kebab>`（如 `cx-button`、`cx-grid`、`cx-simple-card`）。
- **物料数组导出**：默认导出物料数组（`packages/comps-nuxt-ui-v4/src/nuxt-ui-2/index.ts` 同时做命名导出与 default 数组导出）。
- **composable**：`use-cx-<thing>` 目录 + `index.ts`；运行时 hooks 仓库 `packages/vue/src/hooks/use-cx-*`。

**目录约定：**

- `src/` 下每个物料目录结构：`index.ts`（normalize 出口） + `src/index.vue`（实现） + 可选 `panel/`（右侧编辑器配置表单）、`slots/`（插槽绑定函数）、`types/`（局部类型）、`utils/`（局部工具）。
- 类型集中目录：`packages/definition/src/types/{defined,runtime,helper}/`，每类一个 `index.ts` 聚合。
- 事件相关：`packages/definition/src/events/` 与 `packages/renderer/src/event/`（后者仅做兼容转发 + `native-event.ts`）。

**脚本命名：**

- 根脚本：`dev:playground`、`build`、`test`、`typecheck`、`check`（符合偏好"dev:<subpkg-name>"）。
- 子包脚本：`build`（`vp pack`，nuxt 例外用 `nuxt-module-build`）、`typecheck`（`vue-tsgo` / `tsgo --noEmit`）。
- playground：`dev`、`build`、`typecheck`、`gen:mocks`。

## 新代码该放哪

**新增一个 cx 物料（基础物料）：**

- 入口：`packages/comps/src/<category>/<name>/index.ts`，参考 `packages/comps/src/grid/index.ts` 模板——`normalize({ name, key, icon, description, component, props, slots?, ... })`。
- 实现 SFC：`packages/comps/src/<category>/<name>/src/index.vue`。
- 表单 panel：`packages/comps/src/<category>/<name>/panel/<form>.vue`（可选）。
- 桶文件注册：在 `packages/comps/src/<category>/index.ts` 加 `export`，并在 `packages/comps/src/index.ts` 按分类暴露。
- 烟雾测试：在 `packages/comps/tests/materials.test.ts` 加一个挂载 smoke。

**新增一个基于 Nuxt UI 的物料：**

- 入口：`packages/comps-nuxt-ui-v4/src/nuxt-ui-2/<name>/index.ts`，参考 `button/index.ts`。
- 实现 SFC：`packages/comps-nuxt-ui-v4/src/nuxt-ui-2/<name>/src/index.vue`。
- 插槽绑定：`<name>/slots/index.ts`（如需），参考 `button/slots/`。
- 桶注册：在 `packages/comps-nuxt-ui-v4/src/nuxt-ui-2/index.ts` 加命名导出 + 加入默认导出数组。
- 测试：`packages/comps-nuxt-ui-v4/tests/materials.test.ts`。

**新增一个 composable（运行时 hook）：**

- 目录：`packages/vue/src/hooks/use-cx-<thing>/index.ts`（CX 强相关）或 `packages/vue/src/hooks/use-<thing>.ts`（通用）。
- 聚合：在 `packages/vue/src/hooks/index.ts` 按"分组注释"（`/** Utils? */` / `/** CxCmpt */` / `/** CxRender */` / `/** Global */`）追加 `export *`。

**新增一个 Vue 工具（非 composable）：**

- 单文件：`packages/vue/src/vue/<thing>.ts`，在 `packages/vue/src/index.ts` 加 `export * from './vue/<thing>'`。

**新增 definition 工具 / 类型：**

- 工具：`packages/definition/src/utils/<thing>.ts` + 在 `utils/index.ts` 暴露。
- 类型：`packages/definition/src/types/<defined|runtime|helper>/<thing>.ts` + 对应 `index.ts` 暴露。

**新增 playground 业务页面：**

- 页面：`playground/app/pages/<route>.vue` 或子目录 + `index.vue`（Nuxt 约定式路由）。
- 业务模块：`playground/app/standup/<module>/`，参考现有结构（`apis/` `components/` `hooks/` `states/` `utils/` `views/`）。
- mock API：`playground/server/api/<name>/<action>.post.ts`；种子数据生成放 `playground/scripts/generate-mocks.mjs`；契约测试放 `playground/tests/mock-contract.test.ts`。

**新增测试：**

- 单元/物料 smoke：`packages/<pkg>/tests/<thing>.test.ts` 或 `packages/<pkg>/src/**/*.test.ts`（两者都被根 `vite.config.ts` 的 `test.include` 覆盖）。
- 集成/契约：`playground/tests/<thing>.test.ts`。
- 公共 setup：`playground/tests/setup.ts`（h3 工具 + fetch stub）。

## 特殊目录

**`packages/comps-nuxt-ui-v4/vendor/`**

- **用途：** vendored Nuxt UI v2 源码 + 离线 shim，让物料库脱离 Nuxt 运行时也能独立打包测试。
- **生成：** 否（手工 vendored，按 MIT 协议携带原版 `LICENSE.md`）。
- **提交：** 是。
- **特殊规则：** `@voidzero-dev/vite-plus` 的 lint/fmt 默认忽略此目录（`vite.config.ts` 的 `lint.ignorePatterns` 与 `fmt.ignorePatterns`）；shim 文件首行带 `@ts-nocheck`，**不参与类型质量门**。

**`dist/`（每个包）**

- **用途：** `vp pack` / `nuxt-module-build` 产物。
- **生成：** 是。
- **提交：** 否（按 npm 包 publish 流程取用）。
- **特殊规则：** lint/fmt 忽略；tsconfig 不包含。

**`playground/.nuxt/` 与 `playground/.output/`**

- **用途：** Nuxt prepare 与 build 产物。
- **生成：** 是（`nuxt dev` / `nuxt build` / `nuxi prepare`）。
- **提交：** 否。
- **特殊规则：** lint/fmt 忽略。

**`playground/mocks/data/`**

- **用途：** mock 种子 JSON，由 `scripts/generate-mocks.mjs` 生成；以当日为锚、同日幂等。
- **生成：** 是。
- **提交：** 是（保证断网可运行）。
- **特殊规则：** `fmt.ignorePatterns` 忽略（不格式化生成产物）。

**`zRefs/`（全局 ignore，不在仓库内）**

- 用户调试第三方库与参考资料的暂存区，被全局 gitignore 屏蔽，与项目本体无关。

_结构分析：2026-07-20_
