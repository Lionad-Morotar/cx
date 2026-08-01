# 代码库隐患（Codebase Concerns）

**分析日期：** 2026-07-20

本文件汇总 cx monorepo 内值得后续治理的隐患点，按主题分组。每条记录尽量给出可定位的文件路径、触发条件、影响范围与修复路径，供 `/gsd:plan-phase` 直接消费。

## 技术债务

### 根目录 `vite.config.ts` 内绝对路径硬编码（不可移植）

- 现状：`vite.config.ts` 第 11-26 行的 `resolve.alias` 把 6 条 alias 全部写死为 `/Users/lionad/Github/Lionad-Morotar/cx/...` 绝对路径，包括关键的 vue 单例归一 alias
- 文件：`vite.config.ts:14-25`
- 影响：
  - 任何非 lionad 用户、CI runner、Docker 构建环境一启动 vitest 就会因路径不存在而崩溃
  - 即便 alias 路径存在，vue 指向的 `.pnpm/vue@3.5.26_typescript@7.0.2/...` 是 pnpm 硬链接目录，pnpm 版本变化或 lockfile 重算后路径会漂移
  - 子包 `vue-tsgo --tsdk ../../node_modules/.pnpm/typescript@7.0.2/...` 同类问题（见各包 `package.json` 的 `typecheck` 脚本）
- 修复路径：
  - 用 `fileURLToPath(new URL('./node_modules/.pnpm/vue@...', import.meta.url))` 或 `import.meta.dirname` 拼相对路径
  - 更稳妥的方式是 `import { createRequire } from 'module'; require.resolve('vue')` 让 pnpm 自己解析实际副本路径
  - typecheck 脚本改为 `vue-tsgo --noEmit`（让 tsgo 自动发现 TS SDK），不要硬编码 `--tsdk` 路径

### `types/helper/index.ts` 整文件 `@ts-nocheck`

- 现状：类型体操集合被整体 `@ts-nocheck`，注释承认“在 tsgo/TS7 下求值行为未经实测，豁免待后续治理验证后摘除”
- 文件：`packages/definition/src/types/helper/index.ts:2`
- 影响：
  - 该文件导出的 `IsEqual`、`IsEveryTrueThen`、`NormalizeKey`、`Guard<M>` 等被 `normalize/component.ts` 的核心泛型约束直接使用，类型错误完全静默
  - `normalize/component.ts:100-142` 的 `Guard<M>` 是 normalize API 的契约守卫，但任何类型回归都无法被 `tsgo --noEmit` 捕获
- 修复路径：
  - 按 type-fest 风格把高风险类型迁移到经过 TS7 实测的等价实现
  - 为该文件补一份“类型行为快照测试”（`expectTypeOf` 或 `tsd`），用 CI 锁定语义
  - 摘除 `@ts-nocheck` 后，逐个 `@ts-expect-error` 标注真正无法解决的条目

### 类型断言元组长度错配（潜伏的越界风险）

- 现状：`use-prop-css-block-box.ts` 内 `unzipValue` 多处把 `string[]` 强转为远长于实际解构元素数的元组类型：
  - 564-578 行：解构 4 个 `[t,r,d,l]`，类型断言却写为 12 元组
  - 750-767 行：解构 6 个 `[d,a,g,f,r,b]`，断言为 12 元组
  - 962-976 行：解构 7 个 `[l,a,s,w,c,f,fs]`，断言为 12 元组
- 文件：`packages/vue/src/hooks/use-cx-props/use-prop-css-block-box.ts`
- 影响：
  - TS 不会在越界访问时报警，未来如果有人对返回数组按下标取值，类型层完全无保护
  - 阅读者难以判断字段真实数量，文档与实现易脱节
- 修复路径：把 `as [string, string, ...]` 改为与解构数一致的元组；用 zod schema 校验输入字符串结构后再断言

### `as any` 与 `: any` 在物料层泛滥

- 现状：`packages/comps-nuxt-ui-v4/src/nuxt-ui-2/` 下几乎所有物料文件的 `hidden`、`slots`、`pickData` 回调参数都标注为 `({ cmpt }: any)` 或 `({ data }: any)`
- 文件示例：`badge/index.ts:16,22,28`、`button/index.ts:69,75,102`、`table/index.ts:87,97,136,206`、`select-menu/index.ts:49,56,63,121`、`alert/index.ts:63,65,91`
- 影响：
  - 物料层是组件契约的“权威定义”，类型描述缺失会让所有消费物料的编辑器/面板失去静态校验
  - `slots: ({ cmpt }: any) => { ... }` 把 cmpt 形态完全交给开发者记忆，重构 `CxComponentRuntime` 时物料层不会产生编译错误
- 修复路径：从 `@lionad/cx-definition` 导出 `CxPropCTX`/`CxSlotCTX` 等标准上下文类型，物料层强制使用；用 oxlint 规则 `@typescript-eslint/no-explicit-any` 在物料目录单独开启 error

### `useHooks` 全局单例依赖函数名唯一性

- 现状：`use-fn.ts:8` 模块级 `globalHooks = new kareem()`，`useHooks = genUseHooks(globalHooks)` 是全局共享实例；pre/post/cancel/touch 钩子按 `${fn.name}-${nanoid()}` 注册
- 文件：`packages/definition/src/utils/use-fn.ts:8-19, 269`
- 影响：
  - 函数名重复或被 minifier 改名时，不同 `useHooks` 实例的 cancel 钩子会串到同一个 name 上
  - `globalHooks._pres/_posts/_cancels/_touches` 不会被 `tryOnScopeDispose` 清理（清理只在 `hooksInstance !== globalHooks` 时发生，见 245 行），属于进程级泄漏
  - `runtime.ts` 的 `addComponent.cancel`、`removeComponent.cancel`、`moveComponent.cancel` 都依赖此机制，一旦串名会触发“撤销了别的操作”的灾难性 bug
- 修复路径：废弃全局 `useHooks`，强制所有消费方走 `genUseHooks()` 创建 scope-local 实例；或者把 name key 从函数名改为 `Symbol` + `WeakMap<Fn, string>`

### `runtime.ts` 内未摘除的 `throw new Error('deprecated')` 死分支

- 现状：4 处直接抛 `'deprecated'` 字符串错误，注释/上下文表明这些分支是“历史 API 已下线，仅留兜底”
- 文件：`packages/definition/src/utils/runtime.ts:225, 254, 392, 570, 710`
- 影响：
  - 类型层未用 `never` 标注，TS 仍认为分支可达，扩大了联合类型推断空间
  - 这些分支在测试与生产中理论不可达，但若上游误传非 `isSlottedCxComponentGroup` 形态的数据，会得到含义模糊的 `'deprecated'` 异常
- 修复路径：用 `assertNever` 或显式 `: never` 收敛分支；若语义是“不再支持”，直接删掉分支让上游类型报错

### 历史兼容别名累积（`Loader`、`LoaderInstance`、`CxEventDeprecated`、`props.default`）

- 现状：
  - `packages/definition/src/loader/index.ts:428-431`：`@deprecated export const Loader = CxLoader`
  - `packages/definition/src/types/defined/cx-loader.ts:19-22`：`@deprecated LoaderInstance`
  - `packages/definition/src/types/runtime/cx-event.ts:43-51`：`CxEventDeprecated`
  - `packages/definition/src/types/defined/cx-component-meta/props.ts:82-86`：`@deprecated use initial instead` 的 `default` 字段仍保留
- 影响：新旧 API 同时暴露让消费方选择困惑，类型联合空间被撑大
- 修复路径：先用 `rg "Loader[^I]|CxEventDeprecated|props.default"` 全仓搜索消费点，迁移后一次性移除

### `use-focus.ts` 内函数名拼写错误（API 级影响）

- 现状：`playground/app/standup/hooks/use-focus.ts` 导出的 handlers 键名为 `goThroghLeft/Right/Up/Down`（`Throgh` 缺一个 `u`），实现函数名 `goThroughPrevandler`（`Prevandler` 既拼错又与 `NextHandler` 不对称）
- 文件：`playground/app/standup/hooks/use-focus.ts:50-53, 357, 369, 427, 446, 465, 484`
- 影响：
  - 外部消费方按 `goThroughLeft` 调用会 undefined；按 `goThroghLeft` 又是明显错字
  - 拼错扩散到调用方后改名成本随消费点数量线性上升
- 修复路径：playground 站会模块当前是 demo，单点改名即可；`Prevandler` → `PrevHandler`，`goThrogh*` → `goThrough*`

### 重复的样式 hook 工厂代码（可维护性差）

- 现状：`use-prop-css-block-box.ts` 单文件 1247 行，`useCxStyleSpacing`、`useCxStyleBox`、`useCxStyleFont`、`useCxStyleCosm`、`useCxStyleLayout` 5 个工厂结构高度相似（都重复 `isEnabled`、`toggleEnable`、`isInited`、`init`、`reset`、`whenever(() => !isEnabled.value, reset)`、`onChangeFn`、`watch(values, ..., { deep: true })`）
- 文件：`packages/vue/src/hooks/use-cx-props/use-prop-css-block-box.ts`
- 影响：
  - 行为差异（如 `getZipValue` 字段顺序、`unzipValue` 类型断言）靠人肉复制粘贴保持一致，已经有 4 处类型断言错配的痕迹
  - 1247 行远超 FILE_LEN 300 行的拆分阈值
- 修复路径：抽取 `createStyleHook({ fields, serialize, unserialize })` 通用工厂；按样式类别拆为 `spacing.ts`、`box.ts`、`font.ts`、`cosm.ts`、`layout.ts` 5 个文件

### renderer 包 28 个 TS7 类型错误（typecheck 门禁唯一红区）

- 现状：`packages/renderer` 三个文件在 typescript 7 下共 28 个类型错误：`render-component-with-bindings.vue` 16 处（`MaybeRef` 不再从 `@vueuse/core` 导出、`_debug_verbose` 全局属性缺失、style* 系列 possibly-undefined、`CxComponentStyle` 不可作索引、4 处失效的 `@ts-expect-error`）、`render-component.vue` 11 处（`SlotContext` 双向转换不重叠、`Component` 联合类型不可赋值、overload 失配）、`render.vue` 1 处（`_debug` 全局属性缺失）
- 影响：pnpm `-r` 默认 bail 曾使根 typecheck 在更靠前的包失败后永远走不到 renderer，错误自 TS6→7 升级起长期隐藏；门禁恢复后 renderer 是唯一失败包，`pnpm typecheck` 退出码仍为 1
- 修复路径：与 `types/helper` 的 `@ts-nocheck` 治理同属 TS7 适配工程——逐文件核实 `@ts-expect-error` 是否仍有意义、`SlotContext` 转换改经 `unknown` 中转、全局 `_debug*` 属性补 ambient 声明；治理完成前 typecheck 结果解读为"除本条目外全绿"

## 已知缺陷

### `CxLoader.fetchModule` 多分支 Promise 反模式

- 症状：`new Promise(async (resolve, reject) => { ... })` 内 `customFetcher` 成功 `resolve` 后，后续 `moduleType === 'esm'`、`'umd'`、`'module-federation'` 三个 if 仍会继续执行；resolve 后再 reject 会被 Promise 静默吞掉
- 文件：`packages/definition/src/loader/index.ts:172-255`
- 触发：当 `config.fetchModule` 配置且同时设了 `moduleType`，会发起两次模块加载；如果 `customFetcher` 抛错但后续 umd 分支成功，错误会被吞
- 规避：当前 playground 通过 nitro server 直接代理 mocks，未触发 fetchModule 远程路径
- 修复路径：把四个 if 改为 `if/else if/else if`；或者把 Promise 构造拆成 `async function` + 显式 return

### `CxLoader.installComponentsFromMetadata` 用 `setTimeout(0)` 注册异步组件

- 症状：异步组件 loader 解析后，把 `installedAsync[installKey] = ...` 推迟到 `setTimeout(() => cmpts.forEach(...))` 中执行，目的是“等待异步组件渲染结束”，但没有同步 await 渲染完成
- 文件：`packages/definition/src/loader/index.ts:352-360`
- 触发：异步组件渲染时长 > 一个 tick 时，组件树会读到不完整的 `_cx_meta`
- 规避：当前 playground 主要用本地 `@lionad/cx-comps` 同步物料，未触发异步加载路径
- 修复路径：用 `nextTick` + `app.runWithContext` 包裹注册；或显式返回 Promise 让 `installComponent` 等待

### `runtime.ts` 的 `calcSlots` 有未实现的 debounce

- 症状：`let calcSlotsTick` 声明后只读不写（`if (calcSlotsTick) clearTimeout(calcSlotsTick)` 永远不成立），意图中的防抖实际是空操作
- 文件：`packages/definition/src/utils/runtime.ts:79-83`
- 触发：高频调用 `calcSlots`（例如面板批量更新）时预期防抖失效，每次都会全量重算 slots
- 规避：当前调用频率低，未观察到性能问题
- 修复路径：要么彻底删除 `calcSlotsTick`（YAGNI），要么补齐 `calcSlotsTick = setTimeout(...)` 完成防抖语义

### `useQuery` 的 `setInterval` 用 `getRetryTimeout(count.value, 100)` 只在启动时求值一次

- 症状：`tick = setInterval(() => {...}, getRetryTimeout(count.value, 100))` —— interval timeout 在 `start()` 时根据当时的 count 固化，之后 `count.value++` 不会改变轮询间隔
- 文件：`packages/vue/src/vue/dom.ts:43-63`
- 触发：依赖 `useQuery` 做指数退避的场景实际得到的是固定间隔轮询
- 规避：当前 cx 物料未使用 `useQuery`，仅作为公共 API 暴露
- 修复路径：改成 `setTimeout` 递归调度，或用 `useIntervalFn`（@vueuse/core）配合 computed

### playground mock 层在 nitro 热重载时丢失内存态写入

- 症状：`mock-store.ts` 用模块级 `Map` 缓存写入，但 nitro dev server 文件变动会重建模块导致 `cache` 重置，写操作回退到种子 JSON
- 文件：`playground/server/utils/mock-store.ts:5-7, 13`
- 触发：开发者在 dev 模式下编辑任何 server 文件，所有未持久化的 standup 编辑全部丢失
- 规避：演示场景下预期行为，文档已声明
- 修复路径：用 SQLite 或 JSON 文件持久化层；或加显式 `/api/reset` 端点提示用户

## 安全考量

### Mock 数据历史含真实公司字样（已有红线测试）

- 风险：`playground/tests/mock-contract.test.ts:276-305` 显式拼接了 7 个受限字样（`'cyber'+'cloud'`、`'log'+'hub'`、`'it'+'tx'`、`'t'+'tx'`、`'/e'+'ap/e'+'ap'`、`'/app/co'+'rm'`、`'jw'+'t'`）作为扫描黑名单
- 文件：`playground/mocks/data/*.json`、`playground/tests/mock-contract.test.ts`
- 当前缓解：红线测试全量扫描所有 mock JSON；字样在测试代码中字符串拼接构造以避免被全仓 grep 误命中
- 建议：
  - mock 数据本身不应承载真实公司名/产品名/账号体系，建议全部替换为虚构 demo 词汇
  - 红线测试的“拼字游戏”是临时方案，长期建议加 git pre-commit hook 扫描历史 commit 防止回归

### `.npmrc` 文件被清空但未提交

- 风险：`.npmrc` 从原本的 `only-built-dependencies[]=vue-demi` + `production=false` 被改为空文件，配置迁到 `pnpm-workspace.yaml:10-17` 的 `onlyBuiltDependencies` / `allowBuilds`
- 文件：`.npmrc`（工作区改动未提交）
- 当前缓解：`pnpm-workspace.yaml` 的配置在新版 pnpm 下生效
- 建议：确认 pnpm 12 alpha 的 workspace 配置语义后提交 `.npmrc` 清空改动，避免“配置两份、一份失效”的混淆

### 仓库根存在 `Agents.md` 与 `Claude.md` 软链未入库

- 风险：`Claude.md` 是符号链接指向 `Agents.md`；两者均为未跟踪文件
- 文件：`Agents.md`、`Claude.md -> Agents.md`
- 当前缓解：项目级 `Agents.md` 是手动维护的 agent 上下文文档
- 建议：决定是否纳入版本控制；如果纳入，`Claude.md` 软链应在 `.gitignore` 中显式忽略以避免平台兼容性问题

## 性能瓶颈

### `useCxStyle*` 的 `watch(values, ..., { deep: true })` 在所有 hook 实例上常驻

- 问题：每个 `useCxStyleBox/Spacing/Font/Layout/Cosm` 实例都注册一个 deep watcher，仅用于触发用户传入的 `onChange`
- 文件：`packages/vue/src/hooks/use-cx-props/use-prop-css-block-box.ts:162-172, 454-464, 605-615, 796-806, 1006-1016, 1208-1218`
- 原因：`values` 是 computed，deep watch 会递归遍历内部 ref；每个 hook 实例独立 watcher，组件树大时 watcher 数量线性放大
- 改进路径：
  - 注释中已标 `// todo perf when onChangeFn is not null`，可在 `onChangeFn` 为空时直接跳过 watch 注册
  - 改为 `watchEffect` +手动依赖收集，避免 deep 遍历

### `runtime.ts` 多处 `toRaw` + `readonly` 包装产生响应式开销

- 问题：`calcName`、`calcDataConfigs`、`calcSlots`、`calcChildren` 等每次调用都 `toRaw(_cmpt)` 然后再 `readonly(cmpt)` 包回；`readonly(cx)` 在 `createCxRuntimeUtils` 入口一次性包装，但内部又 `unref(cx.datas.cmptsIdMap)` 解包
- 文件：`packages/definition/src/utils/runtime.ts:37, 41-49, 57, 85, 111, 129`
- 原因：API 表面想做不可变契约，但运行时性能开销在每次调用
- 改进路径：在 dev 模式保留 readonly，prod 模式直接裸用原对象（类似 `hmrFreeFreezing` 的策略）

### `CSSParser` 在每次 scoped css 处理时重建实例

- 问题：`css-parser.ts` 是 class，每次 parse 都 `new CSSParser()` 再 `.exec()`
- 文件：`packages/vue/src/hooks/use-scoped-css/css-parser.ts:15-29`
- 原因：scoped css 处理在物料渲染时高频触发；class 实例化 + GC 压力
- 改进路径：用模块级函数 + 闭包变量复用；或加 memoize 缓存 `(cssText, prefix) → result`

## 脆弱区域

### Vue 单例身份分裂（pnpm peer 风味）

- 文件：`vite.config.ts:11-14`（alias hack）、`pnpm-workspace.yaml:5-8`（vue 固定 3.5.26）
- 易碎原因：pnpm 的 typescript peer 风味会安装两个物理 vue 副本，导致 `useTemplateRef` 依赖的 `EMPTY_OBJ` 单例身份分裂；alias 强制归一是 workaround 而非根治
- 安全修改：
  - 升级 vue 前先在 `pnpm-workspace.yaml:8` 同步 pin 版本
  - 改动 `vite.config.ts` alias 时必须同步跑 `pnpm test` 验证 vue 解析路径未漂移
  - 任何引入新 vue peer 依赖（如新的 vue ecosystem 包）的 PR 都要复跑全量测试
- 测试覆盖空白：没有针对“vue 单例身份”的回归测试；目前靠 `packages/comps-nuxt-ui-v4/tests/materials.test.ts` 的物料挂载间接验证

### `vendor/shims/` 离线化的 Nuxt 虚拟模块

- 文件：`packages/comps-nuxt-ui-v4/vendor/shims/imports.ts`、`app.config.ts`、`ui-colors.d.ts`、`nuxt-schema.d.ts`
- 易碎原因：
  - vendored nuxt-ui v2 组件依赖 `#imports`、`#app`、`#build/app.config`、`#ui-colors`、`nuxt/schema` 等虚拟模块；离线 shim 给出降级实现
  - `imports.ts` 的 `useId` 用进程内 `idSeed` 递增，SSR 场景下服务端和客户端 id 不一致会导致 hydration mismatch
  - `useState` 用模块级 Map，多个 CxLoader 实例会共享 state（非 Nuxt 场景的预期行为）
  - `useHead` 降级为 no-op，依赖 head 注入的组件（如 Notifications）功能受限
- 安全修改：
  - shim 改动需要同步 `vite.config.ts:15-25` 的 alias 指向
  - 任何物料层升级（nuxt-ui v2 → v3）都需要重新评估 shim 完整性
- 测试覆盖：`packages/comps-nuxt-ui-v4/tests/materials.test.ts` 仅 smoke 测试 cx-button/badge/alert 三个物料

### `runtime.ts` 的撤销（cancel）钩子链

- 文件：`packages/definition/src/utils/runtime.ts:479-500, 587-612, 673-695`
- 易碎原因：`addComponent.cancel` 反向调用 `removeComponentSource`；`removeComponent.cancel` 反向调用 `addComponentSource`；`moveComponent.cancel` 同时反向调用两者；cancel 钩子内部抛错会被 `use-fn.ts:188-190` 的 try/catch 吞掉
- 安全修改：
  - 修改 `addComponentSource` / `removeComponentSource` 签名时必须同步检查所有 `.cancel()` 回调
  - cancel 链路没有单测保护（`runtime-algorithms.test.ts` 只测算法，未覆盖撤销语义）
- 测试覆盖空白：撤销链路 0 单测

### `normalize/component.ts` 的泛型守卫 `Guard<M>`

- 文件：`packages/definition/src/normalize/component.ts:100-142`
- 易碎原因：用 `IsEveryTrueThen` 串联 5 条类型断言（name 非空、key kebab-case、component 是 Vue 组件、props/emits/exposes 键名合法）；任何一条失败会让整个 `m: GM` 推断为 `never`，调用方得到不友好的“never 不可赋值”错误
- 安全修改：
  - 修改 `Guard<M>` 前先评估错误信息可读性
  - 修改 `types/helper/index.ts` 内的 `IsEveryTrueThen`/`IsKebabCase` 等基础类型时要同步跑 normalize 相关测试
- 测试覆盖：`packages/definition/tests/normalize.test.ts` 仅 141 行，覆盖 happy path，未覆盖 Guard 拒绝路径

## 扩展上限

### CxLoader 单实例并发加载

- 当前容量：`installComponentsFromMetadata` 用 `NPromise.map(..., { concurrency: 6 })` 加载物料
- 上限：metadata 列表 > 60 条时，并发 6 个 script 注入会触发浏览器同源并发限制（HTTP/1.1 下 6 个），后续请求排队
- 扩展路径：
  - HTTP/2 或 HTTP/3 server push
  - metadata 分片按域分发
  - 物料打包为 single bundle 一次性加载（牺牲懒加载换并发）

### 组件树深度

- 当前容量：`runtime.ts` 的 `calcRoot`、`calcChildren`、`reInitComponentDeep` 是递归实现，无深度限制
- 上限：组件树深度 > 1000 时可能触发 JS 栈溢出；`reInitComponentDeep` 同时支持 4 种形态（单组件/数组/数组数组/slot map）的递归，类型断言错配会让某些形态直接走 fallback
- 扩展路径：改递归为迭代；按 slot 分批 hydrate

### Vitest 测试规模

- 当前容量：6 个包共 5 个 test 文件 524 行；playground 7 个 test 文件 712 行；总计约 1236 行测试
- 上限：现状基本无压力；但随着组件物料增长（现已 40+ 物料），`materials.test.ts` 这种“全量挂载”策略会线性变慢
- 扩展路径：物料 smoke 测试按子目录分片；引入 vitest sharding 配合并行

## 风险依赖

### `vue` 固定 3.5.26（pnpm overrides）

- 风险：`pnpm-workspace.yaml:8` 强制 pin vue 到 3.5.26，但所有包的 `peerDependencies.vue` 都写 `^3.5.0`；消费方安装 cx 包时若本地 vue 已是 3.5.27+，pnpm 会在 cx 包内部强制降到 3.5.26，再次触发单例身份分裂
- 影响：vue 升级（3.5.27+ 修复的 bug）无法流入 cx；新 vue 特性（如新的 useTemplateRef 行为）无法使用
- 迁移计划：
  - 短期：跟随 vue 官方 release 节奏 bump pin 版本
  - 长期：等 pnpm 修复 typescript peer 风味问题，或迁移到其他包管理器

### `typescript@^7.0.0`（root）vs `typescript@^6.0.3`（子包 devDeps）

- 风险：根 `package.json` 声明 `typescript@^7.0.0`，子包 devDeps 大多声明 `typescript@^6.0.3`；实际由 pnpm overrides 归一，但声明不一致让消费方困惑
- 影响：IDE 自动解析 TS 版本时可能选错；类型导出在不同 TS 版本下行为差异（尤其是 `verbatimModuleSyntax`）
- 迁移计划：全仓统一到 `^7.0.0`；移除子包 devDeps 的 typescript 条目，仅在 root 声明

### `vue-tsgo`、`vue-tsc`、`tsc` 三套类型检查工具并存

- 风险：纯 TS 包（definition/eslint/nuxt/stream）用 `tsc --noEmit`（typescript@7 的原生实现；原脚本写 `tsgo` 但该 bin 不由 typescript@7.0.2 提供，曾长期失效并遮蔽下游包错误）；`@lionad/cx-vue`/`@lionad/cx-render`/`@lionad/cx-comps`/`@lionad/cx-comps-nuxt-ui-v4` 等 Vue 包用 `vue-tsgo --tsdk ...`；playground 用 `nuxi prepare && vue-tsc`
- 影响：三套工具对模板类型检查的覆盖度不同，vue-tsgo 是相对新的工具，行为可能未稳定；`--tsdk` 硬编码 pnpm 硬链接路径（与本文件首条同类）
- 迁移计划：选一套作为单一来源（推荐 vue-tsgo，符合 Vite+ 工具链），其余工具的配置项收敛

### `nativebird`、`kareem`、`mitt`、`vue-concurrency` 等小众依赖

- 风险：`nativebird`（Promise 增强）、`kareem`（mongoose 内部的 hook 框架）、`vue-concurrency`（任务并发库）都是相对小众的依赖，维护活跃度未知
- 影响：
  - `kareem` 内部 `_pres/_posts` 私有字段被 `use-fn.ts:9-12` 显式 override 类型，依赖了实现细节
  - `nativebird` `import NPromise from 'nativebird'` 用了 `// @ts-expect-error` 绕过类型（`loader/index.ts:12`）
- 迁移计划：评估替换为更主流的等价物（`p-limit` 替代 nativebird 的并发；自定义 hook 实现替代 kareem）

### 包源码改动不重建 dist 时 playground 与包名测试双双失真

- 现状：playground dev server 与「包名 import」的测试（如 `playground/tests/trigger-registries.test.ts`）均经 `exports` 消费各包 `dist/` 构建产物；包内测试（`packages/*/tests/`）则直接 import 源码
- 影响：改包源码后未 `pnpm --filter <pkg> build` 时，包内测试绿（测的是新源码）、dist 级测试也绿（断言与产物同源自洽，如注册表判定清单对照同一旧产物），而 playground 页面行为陈旧——两层测试互相掩盖，只能靠手动页面验证发现（article 流式注册后回放按钮不现身即此路径）
- 缓解：切片涉及 playground 可见行为时，提交前重建受影响包的 dist 并复跑 dist 级测试；长期可评估给 dist 级测试加「产物新鲜度」前置（比较 src/ 与 dist/ mtime）或将 playground vitest 别名切到源码

## 缺失关键特性

### 缺少端到端（E2E）测试

- 问题：仓库内无 E2E 测试框架（playwright/cypress 均未配置）；playground 作为 demo 站点只有单测和契约测试
- 影响：schema → 渲染 → 交互的完整链路没有自动化保护；UI 回归完全靠手动
- 建议：引入 `@nuxt/playwright` 或 `playwright` 配合 playground 的 standup 模块做关键流程 E2E

### 缺少渲染器（renderer）单测

- 问题：`packages/renderer/` 是 schema 渲染的核心包，`packages/renderer/src/` 下 0 个 test 文件
- 影响：render-component.vue 的事件广播、slot 计算、props 过滤等核心逻辑无单测保护；任何重构都是高风险操作
- 建议：优先补 render-component 的单测（props/events/slots 三个维度）

### 缺少 nuxt module（`@lionad/cx-nuxt`）测试

- 问题：`packages/nuxt/` 仅 4 个源文件，0 个 test 文件；module 是 cx 接入 Nuxt 应用的唯一入口
- 影响：module 的 setup 钩子、plugin 注册、composable 自动导入配置未验证
- 建议：用 `@nuxt/module-builder` 自带的 e2e 骨架补一份“带 cx module 的最小 Nuxt 应用” smoke 测试

### 缺少物料变更影响分析工具

- 问题：40+ 物料分散在 `packages/comps/` 和 `packages/comps-nuxt-ui-v4/`，无自动化工具回答“改了这个 prop 类型会影响哪些物料”
- 建议：写一份 `scripts/analyze-materials.mjs`，用 ts-morph 扫描所有 normalize() 调用点，输出 prop → 物料的反向索引

## 测试覆盖空白

### `packages/definition/src/utils/use-fn.ts`（271 行核心 hook 基础设施）

- 未测试：`genUseHooks`、`useHooks`、pre/post/cancel/touch 全链路
- 文件：`packages/definition/src/utils/use-fn.ts`
- 风险：该文件是 runtime.ts 撤销语义的基础，任何 hook 注册/清理 bug 都会扩散到组件增删改
- 优先级：High

### `packages/definition/src/loader/index.ts`（431 行 CxLoader 类）

- 未测试：CxLoader 构造、init、loadMetadata、fetchModule（umd/esm/module-federation 三种模式）、installComponent、installComponentsFromMetadata
- 文件：`packages/definition/src/loader/index.ts`
- 风险：loader 是 schema → 运行时的入口；Promise 反模式、setTimeout 注册等已知问题都没有回归测试
- 优先级：High

### `packages/renderer/src/`（整个渲染器包）

- 未测试：render-component.vue 的事件广播、slot 计算、scoped css 处理
- 文件：`packages/renderer/src/cmpts/render-component.vue`（含 `// TODO 一些组件可能有多个子组件` 等 TODO）
- 风险：renderer 是 cx 系统的核心，零单测意味着任何重构都是赌博
- 优先级：High

### `packages/vue/src/hooks/`（hooks 工厂集合）

- 未测试：`use-task.ts`、`use-cx-props/*`、`use-scoped-css/*`、`use-cx-panel`、`use-cx-states`
- 已测试：仅 `use-request.test.ts`（93 行）
- 文件：`packages/vue/src/hooks/`
- 风险：hooks 是消费方使用 cx 的主要 API 表面，未覆盖会导致公开契约不稳定
- 优先级：Medium

### `playground/app/standup/` 业务逻辑层

- 已测试：仅 `utils/` 工具函数（label、date、formatter）
- 未测试：`hooks/use-focus.ts`（583 行）、`states/issue-filter.ts`（382 行）、`apis/` 全部
- 文件：`playground/app/standup/`
- 风险：playground 虽然是 demo，但 standup 模块是验证 cx 物料可用性的标杆，业务逻辑层 bug 会让 demo 失效
- 优先级：Medium

---

_隐患审计：2026-07-20_
