# 编码约定

**分析日期：** 2026-07-20

## 命名模式

**文件：**

- `.ts` / `.vue` 全部使用 kebab-case：`use-task.ts`、`mock-store.ts`、`time-count.vue`、`view-issues-board.vue`
- 多词文件名禁止下划线与驼峰：`use-cx-interval-fn/index.ts`、`gen-second-to-man-string`
- Nuxt server route 文件采用「路径动词」扁平命名：`playground/server/api/standup/start.post.ts`、`memo/create.post.ts`
- 测试文件与被测对象同名加 `.test.ts`：`utils/date.ts` ↔ `tests/utils-date.test.ts`、`hooks/use-request/index.ts` ↔ `tests/use-request.test.ts`

**目录：**

- 每个目录都配 `index.ts` 桶文件，禁止从子文件深度导入：`import { useRequest } from '@lionad/cx-vue'` 而非 `from '@lionad/cx-vue/src/hooks/use-request'`
- 单组件目录结构统一为 `组件名/index.ts`（normalize 入口）+ `组件名/ui/index.vue`（实际组件）；复杂时拆 `states/`、`types/`、`ui/`：见 `playground/app/standup/components/dashboard-card/{index.ts, ui/index.vue, states/index.ts}`
- 复合 hook 目录：`hooks/use-request/index.ts`、`hooks/use-cx-props/use-prop-image-upload.ts`

**函数：**

- 普通函数 camelCase：`normalize`、`toJSON`、`generateDay`、`getDayRange`、`withDefaultMeta`
- Vue composable 以 `use` 开头：`useRequest`、`useTask`、`useCxBEM`、`useDashboardCard`、`useCxNamespace`
- 工厂函数以 `create` 开头：`createCxDatas`、`createCxUtils`、`genUseNamespace`、`genSecondToManString`
- 谓词函数以 `is`/`has` 开头：`isEmpty`、`isFunction`、`isSlottedCxComponentGroup`、`isTaskIn`

**变量：**

- 局部变量 camelCase：`displayTime`、`startClock`、`contentSeq`
- 模块级常量 camelCase（不使用 UPPER_SNAKE）：`stageLabels`、`statePrefix`、`defaultNamespace`
- 集合类常量在用作「枚举字典」时允许 PascalCase：`StageLabels`（`playground/app/standup/utils/label.ts`）

**类型：**

- `type`/`interface` 一律 PascalCase：`CxLoaderInstance`、`CxComponentMetaDefined`、`RequestEnvelope`、`MemoContent`
- 配置项类型与对应函数同名加 `Opts`/`Options` 后缀：`UseRequestOpts`、`CxNuxtModuleOptions`
- 字面量联合类型用单引号：`'day' | 'week'`、`'none' | 'hide' | 'for'`、`'IN_PROGRESS' | 'ENDED' | 'UNKNOWN'`

**组件：**

- Vue 组件名以 `Cx` 前缀 + PascalCase：`CxText`、`CxHeader`、`CxLogic`、`CxRender`、`CxNuxtUI`、`CxDashboardCard`
- normalize 的 `key` 字段用 kebab-case 且以 `cx-` 开头：`cx-text`、`cx-dashboard-card`、`cx-time-count`
- SFC 内强制 `defineOptions({ name: 'CxXxx' })` 与 key 的 PascalCase 一致（见 `packages/comps/src/basic/src/text.vue:16`、`packages/comps/src/basic/src/block.vue:10`）

## 代码风格

**格式化：** Oxfmt（经 Vite+ 集成）

- 关键设置位于 `vite.config.ts:46` 的 `fmt` 字段
- `semi: false`（**不写分号**）
- `singleQuote: true`（**字符串单引号**）
- 2 空格缩进
- 多行对象/数组尾逗号

**Lint：** Oxlint（经 Vite+ 集成）+ ESLint 10（深度规则层，并存）

- Oxlint 配置位于 `vite.config.ts:38` 的 `lint` 字段；ESLint 配置为共享子包 `@lionad/cx-eslint-config`（`packages/eslint`），根 `eslint.config.mjs` 直接引用其默认预设
- 分工：Oxlint 随 `vp check` 求快；ESLint 提供 Vue/TS/Vitest 生态完整规则，`pnpm lint` 独立跑，两者重叠处以 ESLint 为准
- 格式化一律归 Oxfmt：ESLint 经 eslint-config-prettier 关闭全部格式类规则，不写格式相关规则配置
- 忽略：`dist/**`、`packages/comps-nuxt-ui-v2/vendor/**`、`packages/comps-nuxt-ui-v4/vendor/**`、`packages/comps/src/calendar/vendor/el-calendar/**`、`playground/.output/**`、`playground/.nuxt/**`
- 禁用注释优先使用行内形式：`// eslint-disable-next-line @typescript-eslint/no-explicit-any`（见 `playground/tests/utils-label.test.ts:35`）；多行元素盖不住属性行时用文件级注释并注明 Why（见 `packages/renderer/src/comps/render-component.vue:2`）
- 存量治理期：`no-explicit-any`、`no-unused-vars`、`vue/return-in-computed-property` 等 9 条规则在 cx 预设中降级为 warn（清单与治理优先级见 `packages/eslint/index.js` 的 `LEGACY_WARN_RULES`），治理后恢复 error；**新增代码按 error 标准写**
- `typescript-eslint` 不支持仓库锁定的 TS 7.0（加载即抛错）：`packages/eslint` 包内把 `typescript` 重定向到 `npm:typescript@^6` 副本喂给 lint，typecheck 链路的 TS 7 不受影响
- 自研三规则（`packages/eslint/rules/`，以 `cx/` 前缀注册）：
  - `cx/require-component-name`：组件必须拥有与文件路径一致的规范名，落在 Option Name（defineOptions/defineComponent，PascalCase）与根元素标记 class（kebab）两处；`:class="ns.b()"` BEM 调用视为标记类存在；v4 薄包装经 `skipRootClassPackages` 跳过根 class 校验；fixer 可全量收敛
  - `cx/no-tracking-marker`：注释禁止夹带开发追踪标记（Phase/任务 ID/CR#/Route X 等），只解释 Why；eslint/@ts- 指令注释天然豁免
  - `cx/no-hardcoded-color`：**暂时关闭**——颜色治理依赖物料级设计 Token 源文件（未建），待设计系统落地后恢复；规则本体行为由 `packages/eslint/tests/rules.test.ts` 守护
- 当前全仓状态：0 错误，警告按需治理

**TypeScript：** TypeScript 7（tsgo / vue-tsgo）

- 根 `tsconfig.base.json` 关键严格项：`strict: true`、`noUncheckedIndexedAccess: true`、`verbatimModuleSyntax: true`、`forceConsistentCasingInFileNames: true`
- `noUncheckedIndexedAccess` 生效：数组/对象索引访问返回 `T | undefined`，使用下标结果前必须判空或非空断言（`array[0]!`）
- 每个子包有自己的 `tsconfig.json`（仅类型检查）与 `tsconfig.build.json`（构建期 declaration 产出），见 `packages/vue/tsconfig.json:1`、`packages/vue/tsconfig.build.json:1`
- 类型检查命令：纯 TS 包 `tsgo --noEmit`；含 `.vue` 包 `vue-tsgo --tsdk <typescript-path> --noEmit`
- 类型导出强制 `import type { ... }` 与运行时导入分离（`verbatimModuleSyntax`）

## 导入组织

**顺序（每个区块之间一个空行）：**

1. 外部 npm 包（含 `vue`、`lodash-es`、`@vueuse/core`、`@lionad/cx-*`）
2. 项目内相对路径（`./`、`../`）
3. `import type { ... }` 单独成块（无论是外部还是内部类型）

**示例**（`packages/definition/src/normalize/component.ts:1-24`）：

```typescript
import kebabCase from 'lodash-es/kebabCase'
import upperFirst from 'lodash-es/upperFirst'
import camelCase from 'lodash-es/camelCase'
import { prefix } from '../helper'
import { withDefaultMeta } from './meta'

import { markRaw } from 'vue'
import type { App, Component } from 'vue'
import type { CxComponentRuntime, ComponentProps, ... } from '../types'
```

**注意：** 当前仓库对「外部 vs 内部」分组未严格一致，部分文件先写 `lodash-es` 再写相对路径再写 `vue`（如上例）。**新增代码请遵循：外部包 → 内部相对路径 → 类型导入。**

**路径别名：**

- Nuxt 自动导入：`~/standup/...`、`~~/...`（仅 playground 内，见 `playground/app/plugins/standup-materials.ts:3`）
- 测试统一经根 `vite.config.ts:11` 的 `resolve.alias` 强制 `vue` 单实例（避免 `EMPTY_OBJ` 身份分裂）
- vendored Nuxt 虚拟模块别名：`#app`、`#imports`、`#build/app.config`、`#ui-colors`、`nuxt/schema` 全部指向 `packages/comps-nuxt-ui-v4/vendor/shims/*.ts`，让 vitest 离线工作

**禁止：** 从子包深层路径导入其他子包：错误 `import { useRequest } from '@lionad/cx-vue/src/hooks/use-request'`；正确 `import { useRequest } from '@lionad/cx-vue'`。

## Vue SFC 约定

**块顺序：** `<template>` → `<script setup lang="ts">` → `<style lang="...">`（见 `packages/comps/src/basic/src/text.vue`、`packages/comps-nuxt-ui-v4/src/nuxt-ui-2/select/src/index.vue:1,31,89`）

**`<script setup>`：**

- 一律 `lang="ts"`
- 必须调用 `defineOptions({ name: 'CxXxx' })`，name 与 normalize 的 key PascalCase 一致
- props 优先 `withDefaults(defineProps<{ ... }>(), { ... })`；无默认值时可省略 `withDefaults`
- emits 用数组形式：`defineEmits(['update:component', 'data'])`（见 `packages/renderer/src/cmpts/render.vue:41`）
- 暴露给父组件用 `defineExpose({ ... })`（见 `packages/renderer/src/cmpts/render.vue:152`）

**模板：**

- `v-if` / `v-else-if` / `v-else` 连续，不跨「空行」
- `v-for` 必带 `:key`，且 key 取 `item.id` 或 `index`
- 多 prop 换行：每行一项，闭合 `>` 单独成行
- 自闭合：纯逻辑组件用 `<slot />`，无内容组件 `<CxEmpty />`

**样式：**

- 子包库组件：`<style lang="scss">` + `@layer cx { @include b('block-name') { ... } }`（见 `packages/comps/src/basic/src/text.vue:38-77`、`packages/comps/src/basic/src/block.vue:18-28`）
- 域内组件（playground 站会）：`<style lang="scss">` 或 `<style lang="less" scoped>`（见 `playground/app/standup/components/time-count/time-count.vue:48`）
- BEM 经 `useCxBEM('block-name')` 生成类名：`ns.b()`、`ns.e('content')`、`ns.is('truncate', props.truncate)`（`packages/comps/src/basic/src/text.vue:18`、`packages/vue/src/bem/index.ts:6-93`）
- Tailwind 经 `@apply` 在 `@layer cx` 内使用：`@apply relative min-h-6 text-sm text-neutral-700 dark:text-neutral-300;`
- 命名空间默认 `cx`（`useCxBEM`），可切换：`useBEM` = `p-*`、`useBem` = `p-*`（小写别名）

## 错误处理

**抛错：**

- 不变量失败：`throw new Error('[ERR] <context> not found')`，统一带 `[ERR]` 前缀
  - `packages/definition/src/utils/datas.ts:79` — `throw new Error('[ERR] toCmpt not found')`
  - `packages/definition/src/utils/runtime.ts:359` — `throw new Error('[ERR] anchor not found')`
  - `packages/definition/src/utils/runtime.ts:468` — `throw new TypeError('[ERR] wrong transformation due to incompatible keys')`
- 非法入参：`throw new Error('illegal range ...')`（`playground/app/standup/utils/date.ts:118`）
- 业务死循环兜底：`throw new Error('[ERR] dead in getDayRange, iter times bt ${limit}')`（`playground/app/standup/utils/date.ts:147`）
- 已废弃路径标记：`throw new Error('deprecated')`（`packages/definition/src/utils/runtime.ts:225,254,392,570,710`）

**捕获：**

- Promise 链：`.catch((err: unknown) => { ElMessage.error('网络请求异常'); return Promise.reject(err) })`（`playground/app/standup/utils/cyber.ts:38-42`）
- 业务容错：`try { JSON.parse(...) } catch { return [0] }`（`playground/server/api/standup/memo/create.post.ts:11-16`）
- 容错需注释 Why：`// Why 宽松匹配：种子按 user.id 存储，但调用方可能传 username`（`playground/server/api/standup/memo/get.post.ts:12`）

**业务码约定：**

- 统一响应包络 `{ code, message, success, data }`（`playground/server/utils/mock-store.ts:45-51`）
- `code: '0'` 表示成功，非 `'0'` 由前端拦截器 `ElMessage.error(message)` 弹错但 Promise **正常 resolve**（业务调用方自行判 code，见 `playground/app/standup/utils/cyber.ts:45-48`）
- 网络层失败（reject）单独弹「网络请求异常」并继续 reject

## 日志

**框架：** 原生 `console`（无统一封装）

**约定：**

- `[info]` 前缀：生命周期/装配跟踪（非错误）
  - `console.info('[info] request instance provide in useRequest', request)`（`packages/vue/src/hooks/use-request/index.ts:28`）
  - `console.info('[standup-materials] 25 materials installed')`（`playground/app/plugins/standup-materials.ts:24`）
- `[WARN]` / `[info]` 前缀：可恢复异常
  - `console.warn('[standup-materials] cx instance not found, skip material install')`
  - `console.warn('[info] loop counts too large:', num, 'will be reset to ' + dftLoop)`（`packages/comps/src/basic/src/logic.vue:43`）
- `[ERR]` 前缀：不可恢复错误，常伴随 `throw`
  - `console.error('[ERR] no key in cmpt, skip', cmpt)`（`packages/definition/src/utils/datas.ts:199`）
  - `console.error('[ERR] parent not found', cmpt)`（`packages/definition/src/utils/datas.ts:255`）
- 调试期 `console.log` 留下时改为注释：`// console.log('[debug] meta', meta)`（`packages/definition/src/normalize/component.ts:81`）

**新增日志请：** 写中文上下文 + 选择正确前缀（`[info]` / `[WARN]` / `[ERR]`）。

## 注释

**何时写注释：**

- 文件头 JSDoc 描述模块意图与关键契约（多行 `/** ... */`）：
  - `playground/server/utils/mock-store.ts:1-8` 说明 Why 模块级单例
  - `playground/app/standup/utils/cyber.ts:1-8` 说明请求契约
- 函数 JSDoc 描述「意图」与「注意事项」，**禁止描述做了什么**或夹带外部编号（U1/CR#3/teammate review 等）
- 行内注释解释 Why：隐含假设、折衷、unsound 之处
- 「Why X：」是常见开头模板：`// Why 可重复调用：已有同类型进行中会议时直接复用其 id`（`playground/server/api/standup/start.post.ts:3`）

**JSDoc / TSDoc：**

```typescript
/**
 * Mock 数据存储：种子 JSON 加载 + 内存态写层
 *
 * Why 模块级单例：nitro dev 热重载（server 文件变动）会重建模块，写操作随之内存态丢失、
 * 回退种子数据——这是演示环境的预期行为，见 mocks/README.md。
 * Why 路径回退链：nitro dev 的 cwd 是 playground 根；vitest 从 monorepo 根跑时 cwd 不在
 * playground，故以 import.meta.url 相对位置兜底。
 */
```

**禁止：**

- 描述「做了什么」：`// 设置 endTime`（应改为说明 Why，如 `// endTime 与 startTime 同形态：纯时钟串，前端展示时与 meetingDate 拼接`）
- 开发追踪标记：`// TODO`、`// 阶段 U1`、`// CR#3`、`// teammate review B1`、`// 见 ADR-XXX`
- 引用外部编号（用你自己的话重述 why）

**语言：** 中文为主；技术术语首次出现标注英文（如「物料（Material）」、「包络（Envelope）」）。

## 函数设计

**大小：** 单文件超 300 行考虑拆分（项目级约定，见根 `CLAUDE.md`）；单函数以可一屏读完为度。

**参数：**

- ≤ 3 个：按位置传入
- ≥ 3 个或带可选配置：抽 `Opts` 类型，见 `UseRequestOpts`（`packages/vue/src/hooks/use-request/index.ts:17-23`）
- 工厂配置项采用「函数返回函数」柯里化，便于预设上下文：`genUseNamespace(dftName)(block)`（`packages/vue/src/bem/index.ts:29`）、`genSecondToManString(meters)(input, keepDigit, valLen)`（`playground/app/standup/utils/date.ts:36`）

**返回值：**

- 多返回值用元组 + `as const`：`return [apiNormal, apiCached] as const`（`packages/vue/src/hooks/use-request/index.ts:105`）
- 不变性优先：`cloneDeep` 入参后再修改（`packages/definition/src/normalize/shared.ts:7`）
- 字符串/数字/null 简单值优先；复杂对象给类型别名以便复用

**默认值：**

- Vue props 经 `withDefaults` 显式列出
- normalize meta 经 `withDefaultMeta(m)` 集中兜底（`packages/definition/src/normalize/meta.ts`）
- util 函数默认值就地展开：`fallback = <T = string>(x?, to?) => (x || to || '-') as ...`（`playground/app/standup/utils/formatter.ts:9`）

## 模块设计

**导出：**

- 顶层 `index.ts` 一律用 `export * from './subdir'`，禁止 default + named 混用导致名字冲突
- 物料组件采用「单文件 default + normalize」模式：`export default normalize({ key: 'cx-xxx', ... })`（`playground/app/standup/components/time-count/index.ts:4`）
- 上游桶文件以 `export { default as CxXxx } from './xxx'` 重命名导出（`packages/comps/src/index.ts:1-5`、`playground/app/standup/components/index.ts:1-13`）

**桶文件：** 强制使用

- 每个目录都有 `index.ts`
- 桶文件可加分组注释：`/** CxCmpt */`、`/** CxRender */`、`/** Global */`（`packages/vue/src/hooks/index.ts:14,19,23`）
- 子包顶层桶导出全部公共面：`packages/definition/src/index.ts:10-18`、`packages/vue/src/index.ts:1-18`

**legacy 兼容：**

- 兼容形态需注释标记并指向治理路径，见 `packages/definition/src/index.ts:21-23`：
  ```typescript
  /**
   * legacy 兼容形态：p-ray 时代以 default 聚合对象消费。
   * 命名导出已全覆盖，后续治理阶段评估废弃（default 聚合对 tree-shaking 不友好）。
   */
  export default { ..._cxConfigs, ... }
  ```

## 命名空间与品牌前缀

- 物料 key：以 `cx-` 开头的 kebab-case，例：`cx-text`、`cx-simple-card`、`cx-dashboard-card`
- 物料组件 name：`Cx` + PascalCase（`normalize` 自动从 key 转 camelCase 再 upperFirst，见 `packages/definition/src/normalize/component.ts:83`）
- CSS 类前缀：`cx-<block>__<el>--<mod>`，由 `useCxBEM` 生成（`packages/vue/src/bem/index.ts`）
- 私有属性前缀：`_cx_meta`、`_cx_install`，由 `prefix('meta')` 等动态生成（避免与 Vue 内置属性冲突）

## Nuxt 约定（playground / cx-nuxt）

- 配置文件：`playground/nuxt.config.ts`、`packages/nuxt/src/module.ts`
- Server route 采用「文件即路由」：`server/api/standup/start.post.ts` 自动映射为 `POST /api/standup/start`
- h3 工具（`defineEventHandler`、`readBody`、`getRouterParam`、`setResponseHeader`）依赖 nitro 自动导入；测试环境需手动挂载到 `globalThis`（见 `playground/tests/setup.ts:5-10`）
- Nuxt module 入口：`defineNuxtModule({ meta, defaults, setup(options, nuxt) })`（`packages/nuxt/src/module.ts:18`）
- Nuxt plugin：`defineNuxtPlugin({ name, enforce: 'pre', setup(nuxtApp) })`；客户端与 SSR 分别 `plugin.client.ts` / `plugin.server.ts`

---

_约定分析：2026-07-20_
