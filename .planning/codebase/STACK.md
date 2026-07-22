# 技术栈（Technology Stack）

**分析日期（Analysis Date）：** 2026-07-20

## 语言（Languages）

**主语言：**

- TypeScript 7.0.2 — 全仓 `.ts` / `.vue` SFC `<script lang="ts">` 主语言；所有子包 `package.json` 的 `type` 为 `"module"`，发布产物以 ESM 形态输出（`*.mjs`）
- Vue 3.5.26 SFC（单文件组件） — 渲染器、物料、playground 全部以 `.vue` 编写

**次语言：**

- 原生 CSS（CSS Nesting） — `playground/app/standup` 全部组件样式为 `<style>` 原生 CSS，以 CSS nesting 表达 BEM 与状态层级；历史 SCSS BEM mixin 系统（`styles/mixins/`）与全局 Less（`index.less`/`theme.less`/`atomic.less`）已移除并合并为 `styles/index.css`。`sass-embedded`/`less` 仍在 devDependencies 但已无源码消费
- Shell / Node.js 脚本 — `scripts/codemod-imports.mjs`、`playground/scripts/generate-mocks.mjs`、`scripts/aliases/`

## 运行时（Runtime）

**环境：**

- Node.js `>=22` — 根 `package.json` 的 `engines.node` 约束；CI 与开发机均需满足
- 浏览器 — `playground/nuxt.config.ts` 设定 `ssr: false`，cx 渲染系统在客户端运行（站会组件 setup 顶层直接访问 `window`/`localStorage`）

**包管理器：**

- pnpm `12.0.0-alpha.14` — 根 `package.json.packageManager` 严格 pin
- Lockfile：`pnpm-lock.yaml` 存在并提交（root 目录）
- Workspace 声明：`pnpm-workspace.yaml` 列出 `packages/*` 与 `playground`

**Workspace 配置要点（`pnpm-workspace.yaml`）：**

```yaml
packages:
  - 'packages/*'
  - 'playground'

overrides:
  vite: npm:@voidzero-dev/vite-plus-core@latest # 把 vite 重定向到 Vite+ 内核
  vitest: 4.1.10 # 全仓锁定 vitest 版本
  vue: 3.5.26 # 强制 vue 单例（详见「关键依赖」）

onlyBuiltDependencies:
  - vue-demi # 仅 vue-demi 允许 postinstall 脚本

allowBuilds:
  '@parcel/watcher': true
  core-js: true
  esbuild: true
  vue-demi: true
```

## 框架（Frameworks）

**核心：**

- Vue 3.5.26 — 渲染系统与物料的基础运行时；`pnpm.overrides.vue: 3.5.26` 全仓锁定，避免 pnpm 多 peer 风味导致 `EMPTY_OBJ` 单例身份分裂（否则 `useTemplateRef` 崩溃）
- Vite+ (`@voidzero-dev/vite-plus-core@0.2.5` + `vite-plus@0.2.5`) — 统一工具链出口，对外暴露为 `vp` 命令；底层 = Vite 8.1.5 + Oxlint 1.73.0 + Oxfmt 0.58.0 + Vitest 4.1.10 + tsdown/rolldown
- Nuxt 4.5.0 — 仅 `playground` 与 `packages/nuxt`（作为 Nuxt module）使用；通过 `@nuxt/kit@^4.5.0` / `@nuxt/schema@^4.5.0` / `@nuxt/module-builder@^1.0.2` 集成

**测试：**

- Vitest 4.1.10 — 全仓唯一测试运行器（root `vite.config.ts.test` 段统一配置 include/exclude/setupFiles）
- happy-dom 20.11.0 — `test.environment: 'happy-dom'` 默认 DOM 环境
- @vue/test-utils 2.4.11 — Vue 组件挂载工具

**构建 / 开发：**

- `vp` (Vite+ CLI) — `pnpm build` → `vp run build`（按依赖拓扑 + 缓存）；`pnpm test` → `vp test`；`pnpm check` → `vp check`（fmt + lint + 类型检查一站式）
- `vp pack` — 子包产物打包（tsdown / rolldown 内核；`packages/*/vite.config.ts` 的 `pack` 段配置插件、alias、neverBundle 清单）
- `vue-tsgo@0.3.0` + `tsgo`（TypeScript 7 原生 Go 实现）— 类型检查工具，命令为 `pnpm -r run typecheck`
- `vue-tsc@^3.3.7` — 仅 `packages/{vue,renderer,components,components-nuxt-ui-v4}` 的 `build` 脚本调用 `vue-tsc -p tsconfig.build.json` 生成 `.d.ts`
- `nuxt-module-build build` — `packages/nuxt` 的构建入口（来自 `@nuxt/module-builder`）
- `unplugin-vue@^7.2.0` — 根 `vite.config.ts` 用 `unplugin-vue/vite`（dev/test 场景）；子包 `pack` 段用 `unplugin-vue/rolldown`（生产打包场景）

## 关键依赖（Key Dependencies）

**核心依赖（跨包共用）：**

- `vue@3.5.26` — 单例约束（`pnpm.overrides`）
- `@vue/shared@^3.5.40` — `packages/definition` 直接依赖（共享工具）
- `@vueuse/core@^14.3.0` — 全部子包 peerDeps；`packages/definition` 用 `useMemoize` 缓存远程 metadata；playground 锁定 `^13.9.0`
- `lodash-es@^4.18.1` + `@types/lodash-es` — 几乎所有子包依赖（`camelCase` 等工具）
- `dayjs@^1.11.21` — 日期处理（`packages/vue`、`packages/components`、`playground`）
- `uuid@^14.0.1` + `@types/uuid` — `packages/definition/src/loader` 用于 script 标签 ID 生成（`script-manager.ts`）
- `zod@^4.4.3` — schema 校验（`packages/definition`、`packages/components`、`packages/components-nuxt-ui-v4`）

**definition 包特有：**

- `mitt@^3.0.1` — 事件总线（`packages/definition/src/events/cx-emitter.ts`）
- `nanoid@^6.0.0` — ID 生成
- `nativebird@^1.3.0` — Bluebird-like Promise 扩展（`loader/index.ts` 顶层 `import NPromise from 'nativebird'`）
- `kareem@^2.6.3` — hook 编排（pre/post wrapped hooks，mongoose 同源）
- `bignumber.js@^9.3.1` — 精度安全数值
- `type-fest@^5.8.0` — 类型工具集

**vue 包特有：**

- `@iconify/vue@^5.0.1` — 图标运行时
- `anysort@^2.0.0` — 排序
- `vue-concurrency@5.0.3` — 并发控制（锁定 5.0.3）
- `use-semantic-version@^0.0.7` — 语义版本工具

**components-nuxt-ui-v4 包特有（Nuxt UI 物料依赖）：**

- `@headlessui/vue@^1.7.23` — 无样式行为层组件（vendored nuxt-ui v2 上游依赖）
- `@popperjs/core@^2.11.8` — 浮层定位
- `@vueuse/integrations@^14.3.0` — Vueuse 互操作（fuse.js / universal-favicon 等）
- `defu@^6.1.7` — Nuxt 生态对象合并
- `fuse.js@^7.5.0` — 模糊搜索（CommandPalette 物料）
- `ohash@^2.0.11` — Nuxt 生态哈希工具
- `tailwind-merge@^3.6.0` — Tailwind class 合并
- `v-calendar@^3.1.2` — date-picker 物料底层；`packages/nuxt/src/module.ts` 注入 `v-calendar/dist/style.css`
- `vue-demi@^0.14.10` — Vue 2/3 兼容层（被 vendored nuxt-ui v2 源码依赖；`onlyBuiltDependencies` 允许其 postinstall）

**playground 特有：**

- `nuxt@^4.5.0` — 宿主框架
- `@nuxt/ui@^4.10.0` + `tailwindcss@^4.3.3` — 站会业务组件（模板按 v4 API 裸用 U* 组件与 `useToast`）；与 vendored nuxt-ui v2 物料共存，`app.config.ts` 的 `ui.colors` 用 v4 对象 schema（v2 validator 经 `Object.keys` 兼容读取）
- `vuedraggable@^4.1.0` — 拖拽（参会人排序）
- `chinese-workday@^1.10.0` — 中国法定工作日 / 调休 / 节假日判断（周会「最后工作日」逻辑）
- `number-to-chinese-words@^1.0.20` + `deindent@^0.1.0` + `html-escaper@^3.0.3` — 文案/缩进/转义工具（无类型，`playground/modules.d.ts` 自补 ambient 声明）
- `@unhead/vue@^3.1.8` — head 管理
- `@vueuse/router@^13.9.0` — 路由 composables
- `mitt@^3.0.1` — 站会事件总线（与 definition 同源）

**Vendored 第三方源码（`packages/components-nuxt-ui-v4/vendor/`）：**

- Nuxt UI v2 全量源码（MIT） — 标记 `@ts-nocheck`，不参与 lint/format/typecheck 质量门；`packages/components-nuxt-ui-v4/vendor/bridge.ts` 为显式导入入口
- 配套 shim 在 `vendor/shims/`：`imports.ts`（离线 useId/useState/useAppConfig/useNuxtApp）、`app.config.ts`、`ui-colors.d.ts`、`nuxt-schema.d.ts`
- 根 `vite.config.ts` 通过 alias 把 `#app` / `#imports` / `#build/app.config` / `#ui-colors` / `nuxt/schema` 强制指向上述 shim，使非 Nuxt 消费方也能打包

## 配置（Configuration）

**环境变量：**

- `NODE_ENV` — 唯一被读取的环境变量（`packages/definition/src/loader/config.ts` 导出 `nodeEnv` / `isDev`）
- 无 `.env` 文件 — 仓库根与 `playground/` 均无 `.env*`，无任何 secrets 注入需求（所有 API 由本地 mock 提供）

**构建配置：**

- `vite.config.ts`（根） — Vite+ 出口：Vue 插件、Vue 单例 alias、Nuxt 虚拟模块离线 alias、test 配置、lint/fmt 忽略模式
- `vite.config.ts`（每个子包） — `vp pack` 入口，配置 `unplugin-vue/rolldown` 插件、`deps.neverBundle`（peer 依赖保持外置）、Nuxt 虚拟模块 alias
- `tsconfig.base.json` — 全仓基准 TS 配置：`target: ES2023`、`module: ESNext`、`moduleResolution: bundler`、`strict: true`、`noUncheckedIndexedAccess: true`、`verbatimModuleSyntax: true`、`noEmit: true`
- `tsconfig.json`（每个子包） — 继承 base，加入 `rootDir` / `types` / `include`
- `tsconfig.build.json`（vue / renderer / components / components-nuxt-ui-v4） — 在子包 tsconfig 之上开启 `emitDeclarationOnly`，输出 `.d.ts` 到 `dist/`
- `playground/nuxt.config.ts` — modules 注册 `@nuxt/ui`（须先于 `@lionad/cx-nuxt`）与 `@lionad/cx-nuxt`；`ssr: false`；css 引入 `~/assets/css/main.css`（tailwindcss + @nuxt/ui）、`@lionad/cx-components/style.css` 与 `~/standup/styles/index.less`；`devServer.port: 3209` + `host: '0.0.0.0'`（LAN 暴露）；`compatibilityDate: '2026-07-19'`

**npm 脚本（root `package.json`）：**

```bash
pnpm build          # vp run build — 按依赖拓扑构建所有子包
pnpm test           # vp test — 全仓 Vitest 一次跑
pnpm typecheck      # pnpm -r run typecheck — 每子包独立 tsgo/vue-tsgo --noEmit
pnpm check          # vp check — fmt + lint + 类型检查一站式
pnpm dev:playground # pnpm -C playground dev — 启动 Nuxt dev server (port 3209)
```

**npm 脚本（子包）：**

- `packages/definition`：`build: vp pack`、`typecheck: tsgo --noEmit`
- `packages/{vue,renderer,components,components-nuxt-ui-v4}`：`build: vp pack && vue-tsc -p tsconfig.build.json`、`typecheck: vue-tsgo --tsdk ../../node_modules/.pnpm/typescript@7.0.2/node_modules/typescript --noEmit`
- `packages/nuxt`：`build: nuxt-module-build build`、`typecheck: tsgo --noEmit`、`prepublishOnly: nuxt-module-build build`
- `playground`：`dev: nuxt dev --host 0.0.0.0 --port 3209`、`build: nuxt build`、`typecheck: nuxi prepare && vue-tsc --noEmit -p .nuxt/tsconfig.json`、`gen:mocks: node scripts/generate-mocks.mjs`

## 平台要求（Platform Requirements）

**开发：**

- macOS / Linux / WSL（`node_modules/@voidzero-dev/vite-plus-darwin-arm64@0.2.5` 在 M3 上原生安装；其他平台会拉对应 native binding）
- Node `>=22`，pnpm `12.0.0-alpha.14`
- 无外网依赖：playground 全部 API 走 `/api/**` 本地 Nuxt server routes，断网可完整运行（见 INTEGRATIONS.md）

**生产：**

- `packages/*` 发布到 npm 公开 scope `@lionad/cx-*`（`publishConfig.access: public`）
- `playground` 私有（`private: true`），不发布；部署目标未在仓库内声明

---

_技术栈分析：2026-07-20_
