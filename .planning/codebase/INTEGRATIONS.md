# 外部集成（External Integrations）

**分析日期（Analysis Date）：** 2026-07-20

## 总览

**本仓库无任何外部网络服务依赖。** 所有「外部服务」语义（GitLab 仓库、用户系统、议题、站会、备忘等）均由 `playground/server/api/**` 的 Nuxt server routes 以本地 mock 形式提供，断网可完整运行。详见下方各节。

唯一具备「真实外网」能力的代码路径是 `packages/definition/src/loader/script-manager.ts` 的远程物料加载器（by-design 的低代码能力，由消费方自行承担信任边界），在 cx 自身仓库与 playground 中均未启用。

## API 与外部服务（APIs & External Services）

**GitLab（Mock）：**

- 用途：站会模块展示用户的 GitLab 仓库与议题列表
- 真实形态：无外网调用。`playground/app/standup/apis/gitlab-project/index.ts` 经 `cachedRequest({ url: '/gitlab-projects' })` POST 到本地 Nuxt server route
- Server 实现：`playground/server/api/gitlab-projects.post.ts` 直接 `getCollection('gitlab-projects')` 返回种子 JSON（`playground/mocks/data/gitlab-projects.json`）
- 无 SDK、无 Auth、无 token

**用户 / 议题 / 站会 / 备忘（全部 Mock）：**

- 客户端入口：`playground/app/standup/apis/{user,task,project,standup,label,gitlab-project}/index.ts`
- 统一请求客户端：`playground/app/standup/utils/cyber.ts`（封装 ofetch 的 `$fetch`，`baseURL: '/api'`，统一响应包络 `{ code, message, success, data }`，业务码非 `"0"` 时 ElMessage 弹错但 Promise 正常 resolve）
- Server 端：`playground/server/api/**` 下 20 个端点（11 读 + 8 写 + 1 GET 头像），全部经 `playground/server/utils/mock-store.ts` 的内存态读写
- 完整端点表见 `playground/README.md`（关键端点：`/api/standup/list`、`/api/standup/detail`、`/api/standup/start`、`/api/standup/end`、`/api/standup/participants`、`/api/standup/memo/{get,create,update}`、`/api/issues/{list,user-list,sync,title}`、`/api/project/{detail,select}`、`/api/user/setting`、`/api/users`、`/api/labels`、`/api/avatar/[seed]`）

**远程物料加载器（by-design 能力，本仓库未启用）：**

- 代码：`packages/definition/src/loader/script-manager.ts`
- 行为：从任意 URL 拉取 JS，ESM 模式 = `fetch(url, { cors: true })` + `<script type="module">` 内联注入；UMD 模式 = `<script src="${url}">` 直接挂载
- 调用方：`packages/definition/src/loader/index.ts` 的 `fetchModule` / `CxLoader.init(url, ...)` 路径
- 文档与风险：`packages/definition/README.md`「信任边界」段明确标注——加载器不强制 HTTPS、不校验 SRI、不维护 allowlist、`window[url]` 全局键不清理；物料服务器与传输链路是消费方的完全信任边界
- 当前仓库内的调用形态：`playground` 通过 `app/plugins/standup-materials.ts` 把本地 `~/standup/components` 物料注册进 `CxLoader`，**不触发远程路径**

**HTTP 客户端：**

- 浏览器侧：`ofetch` 的 `$fetch`（Nuxt 4 内置，未显式声明依赖）
- 服务端侧：Nuxt server / Nitro / h3（`defineEventHandler` / `readBody` / `getRouterParam` / `setResponseHeader` 来自 h3，由 nitro 自动导入；vitest 环境由 `playground/tests/setup.ts` 手动挂到 `globalThis`）
- 无 axios、无 got、无 node-fetch

## 数据存储（Data Storage）

**数据库：**

- 无 — 全仓无任何 DB 客户端（无 Prisma / Drizzle / Knex / mongodb / pg / mysql2 / ioredis）
- 唯一持久层：`playground/server/utils/mock-store.ts` 的模块级 `Map<string, unknown>` 内存态单例

**文件存储：**

- 仅本地文件系统
- 种子 JSON：`playground/mocks/data/*.json`（gitlab-projects / issues / labels / memos / project / standups / sync-time / users 共 8 份）由 `playground/scripts/generate-mocks.mjs` 以当日为锚、mulberry32 PRNG 确定性生成，同日幂等
- 加载路径回退链（`mock-store.ts.resolveDataFile`）：优先 `cwd/mocks/data/`（nitro dev 场景，cwd 是 `playground/`）→ `cwd/playground/mocks/data/`（vitest 从 monorepo 根跑场景）→ `fileURLToPath(new URL('../../mocks/data/...', import.meta.url))`（构建产物 cwd 漂移兜底）

**缓存：**

- 无 — `playground/app/standup/utils/cyber.ts` 中 `cachedRequest` 已退化为 `request` 本体，`.clear()` 是 no-op 桩（mock 层数据量小，未重建缓存层）
- CxLoader 的 `fetchModule` 使用 `@vueuse/core` 的 `useMemoize` 做模块级 LRU 式 memo（仅作用于远程物料路径，本仓库未触发）

## 身份认证与身份提供方（Authentication & Identity）

**认证提供方：**

- 无 — 仓库内无任何 auth provider 集成（无 Auth0 / Clerk / Supabase Auth / NextAuth / Firebase Auth / OIDC / OAuth client）
- playground mock 端点 `/api/users`、`/api/user/setting` 仅返回静态用户列表与设置，无登录、无 session、无 token、无 cookie

**实现方式：**

- 不适用 — 站会场景的「当前用户」由 mock 数据固定（如 `createdBy: 'shenyz'`）

## 监控与可观测性（Monitoring & Observability）

**错误追踪：**

- 无 — 未集成 Sentry / Datadog / Bugsnag / Rollbar / PostHog / Elastic APM

**日志：**

- 仅 `console.info` / `console.warn` — 如 `playground/app/plugins/standup-materials.ts` 输出 `[standup-materials] N materials installed`；`packages/definition/src/loader/script-manager.ts` 输出 `[info] found default export`
- 无结构化日志库（无 pino / winston / consola 显式依赖；Nuxt 内置 consola 由框架内部使用）

## CI/CD 与部署（CI/CD & Deployment）

**托管平台：**

- 源码托管于 GitHub（`packages/*/README.md` 链接到 `github.com/Lionad-Morotar/cx`），无部署目标声明

**CI Pipeline：**

- 无 — 仓库根无 `.github/workflows/`、`.gitlab-ci.yml`、`.circleci/`、`azure-pipelines.yml`、`Jenkinsfile`、`.woodpecker.yml`
- 质量门仅在本地通过 `pnpm check`（vp check = oxfmt + oxlint + tsgo 类型检查）手动执行

**部署：**

- `packages/*` 通过 `pnpm publish`（`publishConfig.access: public`）发布到 npm，scope 为 `@lionad/cx-*`
- `playground` 标记 `private: true`，不发布

## 环境配置（Environment Configuration）

**必需环境变量：**

- 仅 `NODE_ENV` — 由 `packages/definition/src/loader/config.ts` 读取，导出 `nodeEnv` 与 `isDev`（dev 模式打印远程物料加载调试信息）
- 无其他必需 env vars；playground 的 mock 层无需任何配置即可启动

**Secrets 存放位置：**

- 不适用 — 仓库内无任何 secret / API key / token 需求；根目录与 `playground/` 均无 `.env*` 文件

## Webhook 与回调（Webhooks & Callbacks）

**入站（Incoming）：**

- 无 — `playground/server/api/**` 是给前端调用的本地 API，不接收第三方服务回调
- `/api/issues/sync` 的「手动同步」仅刷新 `sync-time` 时间戳，不真的拉取外部数据（`playground/server/api/issues/sync.post.ts` 注释明确）

**出站（Outgoing）：**

- 无主动外发 — 除 `script-manager.ts` 的远程物料路径（默认未启用）外，无任何向第三方服务推送的代码

## 浏览器 API 使用（Browser APIs）

虽然不属「外部服务」，但以下是 playground 与 definition 包对浏览器原生 API 的依赖（迁移 / SSR 化时需关注）：

- `window.fetch` — `packages/definition/src/loader/script-manager.ts` 远程物料加载；`window.rawWindow` 优先（微前端场景的沙箱原生窗口）
- `document.head` / `document.createElement('script')` — script-manager 注入远程物料
- `localStorage` — `playground/app/standup/states/project.ts`（用户排序持久化）；playground `nuxt.config.ts` 注释说明 cx 是客户端渲染系统，站会组件 setup 顶层访问 window/localStorage
- `window[url]` — script-manager 把远程 ESM 的 default export 挂到全局键（不清理）
- `window._debugID` — `playground/global.d.ts` 声明的调试用全局

## 第三方 CDN 与外部资源（External CDN & Assets）

- 无 CDN 依赖 — 所有静态资源（SVG 图标、iconfont sprite、字体）均 vendored 在仓库内
- `playground/app/standup/styles/iconfont.js` — 本地维护的图标 sprite，prefix `cx-standup-`，在 `playground/app/plugins/iconfont.client.ts` 客户端注入
- `playground/server/api/avatar/[seed].get.ts` — 首字头像 SVG 由服务端 FNV-1a 哈希 seed 生成 HSL 色相后实时返回（无外部头像服务）

---

_集成审计：2026-07-20_
