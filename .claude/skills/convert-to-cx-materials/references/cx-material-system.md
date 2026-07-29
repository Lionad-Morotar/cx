# cx 物料系统深读

> 本文件解释 cx「物料」的契约与运行时机制——为什么模板长那样。可复制的代码在 `conversion-playbook.md`。
> 路径均以 cx monorepo 根为基准。

## 1. 依赖链与子包角色

```
definition ──▶ vue ──▶ renderer ──▶ comps / comps-nuxt-ui-v2 / comps-nuxt-ui-v4 / comps-vtu ──▶ nuxt
```

- `@lionad/cx-definition`：schema 层。`normalize()`、`CxLoader`、类型系统、事件总线。零 Vue 渲染依赖（vue 是 peer）。
- `@lionad/cx-vue`：Vue 运行时 composables（`useCxBEM`、`useCx*`、scoped-css、style-* 等）+ 共享组件（`CxIcon`/`CxEmpty`）。
- `@lionad/cx-render`：`<CxRender>` 递归渲染器 + bundle `CxRenderBundle`。入口副作用 `import './styles/index.scss'`。
- `packages/comps*`：物料包。每个导出 `CxXxxBundle: CxMaterialBundle`。
- `@lionad/cx-nuxt`：Nuxt module。不 import 任何物料包本体，按开关生成虚拟模块装配清单。

## 2. 物料契约：`normalize()`

`packages/definition/src/normalize/component.ts`。签名要点：

```ts
normalize({
  name,            // 中文展示名（编辑器物料面板），非空串
  description,     // 描述
  key,             // 全局唯一 kebab-case，如 'cx-vtu-terminal'；编译期 IsKebabCase 守卫
  icon,            // Iconify 名，如 'i-tabler-terminal-2'
  component,       // 包装 SFC（Vue 组件）
  headless?,       // 无真实 DOM 的逻辑型物料
  props?,          // CxComponentMetaProps —— 编辑器右侧面板控件描述符（见 §4）
  emits?,          // CxComponentMetaEmits（schema 用 zod）
  exposes?,        // CxComponentMetaExposes（schema 用 zod）
  slots?,          // 数组 | 对象 | 函数 (cmpt) => [...]（动态插槽）
})
```

实现做了什么：

- `component.name = upperFirst(camelCase(key))`（`cx-vtu-terminal` → `CxVtuTerminal`）；`component.key = kebabCase(name)`。
- 挂 `component._cx_meta = meta`、`component._cx_install = (app) => app.component(kebabCase(name), markRaw(component))`。
  （`_cx_meta`/`_cx_install` 经 `prefix()` 生成，避免与 Vue 内置属性冲突。）
- 返回值就是组件本身（不是包装对象）。

### 最小运行时协议（装配方只依赖这两个属性）

```ts
interface CxMaterialComponent {
  _cx_install: (app: App, ...options: any[]) => any
  _cx_meta: { key: string; type?: 'umd' | 'esm' | 'local'; [k: string]: any }
}
```

### 编译期 Guard（`Guard<M>`，同文件）

`GM extends Partial<Guard<M>>`，`Guard` 用 `IsEveryTrueThen` 校验：name 非空、key 是 kebab、component 是 Vue 组件、
props 键名 ⊆ `ComponentProps<component>`、emits 键名 ⊆ 组件 emits、exposes 键名 ⊆ 组件暴露的函数。

`ComponentProps<C> = C extends new (...args:any)=>any ? Omit<InstanceType<C>['$props'], keyof VNodeProps | keyof AllowedComponentProps> : never`

关键：`<script setup>` 的 SFC 类型不匹配 `new (...args)=>any` 构造签名 → `ComponentProps` 解析为 `never` →
`keyof never = PropertyKey`（string|number|symbol）→ `Exclude<你的props键, PropertyKey> = never` → 子集检查恒真。
结论：包装 SFC 用空 `defineProps<{}>()`/`useAttrs()` 也能通过 Guard，不要为了让 Guard 满意去声明 props。
（emits/exposes 同理：wrapper 没 `defineEmits` 时，meta 里也别声明 emits，否则该子检查可能不恒真——本次 v1 因此暂未给交互物料声明 emits。）

## 3. 运行时数据流（data → props → 渲染）

`packages/renderer/src/cmpts/`：`render.vue`（CxRender，顶层，`provide('cx', cx)` 等）→ `render-component.vue`
（单节点，`component :is="cmpt.key"` 解析组件）→ `render-component-with-bindings.vue`（绑指令/样式，真正 `h()` 出物料组件）。

- **data → props**：`cmptDatas = omit({...cmpt.data, ...bindDatas}, ['class','_cx_name','_cx_events','_cx_style','cmpt','_config','_dataConfig','_cx_data_config','_pr','_slotConfig'])`，
  再 `v-bind="cmptDatas"`。即 data 里除 `_cx_*` 元字段外的键，直接成为物料组件的 attrs。
- **cmpt 节点**：`render-component-with-bindings` 额外以 prop 形式注入 `cmpt: markRaw(cmpt.value)`（渲染器自身用 `inject('cx-cmpt')`/`inject('cx')` 取上下文）。
  所以物料包装层经 `useAttrs()` 能同时拿到 data 字段 + `cmpt` + cx 注入的 `class` + `data-is-cx-cmpt`/`data-cx-cmpt-id`/`data-cx-cmpt-key`。
- **slots**：优先级 `cmpt.slots`（运行时节点）> `meta.slots`（物料定义，支持函数/数组/对象）> 兜底 `[{key:'default'}]`；
  每个 slot 交给 `render-components` 拉 `cmpt.components[slot.key]` 递归回 `render-component`。
- **events**：`cmptEvents` 按 `data._cx_events` ∩ meta emits/native events 建监听，经 `cxEmitter` 路由到 `refs.get(target).ref` 调方法。
- **styles**：`render-component-with-bindings` 由 `_cx_style` 算出 cx 编辑器的 box/margin/padding/layout/round/border/font/cosm 类，
  作为 `class` 传给物料组件（这就是为什么包装层会收到 cx 的 class，需要决定保留还是剥离，见 playbook §4）。

> 含义：你的包装 SFC 不需要 `defineProps` 声明业务 props——cx 把 data 当 attrs 灌进来，用 `useAttrs()` 接即可。

## 4. 编辑器面板 props 描述符（`CxComponentMetaProps`）

`packages/definition/src/types/defined/cx-component-meta/props.ts`。props 不是数据类型，是低代码编辑器右侧面板的控件配置。
`type` 判别式（常用）：`short`/`string`/`text`、`textarea`、`richtext`、`number`/`range`、`switch`/`boolean`、
`select`/`options`、`card-selector`（带 `isPreview`/`options`，最常用）、`icon`、`color`、`custom`（自带 `component` 面板）、`json`、`code`。

公共字段：`name`/`label`、`initial`（默认值，可为函数 `(ctx)=>any`）、`options`、`help`、`isPreview`、
`hidden`/`readonly`/`disabled`（可为 `(ctx)=>boolean` 联动）、`effect`、`pickData`、`ui`（透传被包装组件 ui 覆写）。

`Initial` 类型对数组/对象字面量不友好 → 结构化 initial 必须写函数 `initial: () => [...]`。
验收预览的 data 由 `playground/app/dev/material-utils.ts` 的 `buildDefaultData(meta)` 构造：遍历 props.initial，
函数则调用取值，`short` 空串回填「{name}示例」。所以 initial 样本质量 = 验收页预览质量，且样本须满足被包装库的 zod（否则组件 DEV 校验告警/渲染异常）。

## 5. bundle 与 cx-nuxt 装配

`CxMaterialBundle = { name: string; materials: CxMaterialComponent[] }`（`definition/src/types/defined/cx-material-bundle.ts`）。

`packages/nuxt/src/module.ts`：

- `CxBuiltinMaterialSet` 联合类型 + `BUILTIN_BUNDLES: Record<set, { package, namedExport }>`——纯字符串表，cx-nuxt 不依赖任何物料包。
- `addTemplate` 生成 `#build/cx-bundles.mjs`：只把启用的包写进 `import` 语句（未启用不进入构建期解析，真 opt-in）。
- 样式条件注入：仿 v2 的 `v-calendar/dist/style.css`，`specs.some(s => s.package === '<你的包>')` 时 `nuxt.options.css.push('<被包装库 style>')`。

`packages/nuxt/src/runtime/install.ts`：`for (bundle of cxBundles) for (cmpt of bundle.materials) { cmpt._cx_meta.type='local'; cx.installComponent(cmpt._cx_meta.key, cmpt) }`。
`installComponent`（loader）依赖 `this.config!.app`，故必须在 `cx.init(url, { app })` 之后；plugin.client 已保证顺序。

`plugin.client.ts`：`new CxLoader()` → `await cx.init(window.location.href, { app: nuxtApp.vueApp })` → `await installCxBundles` →
`nuxtApp.vueApp.provide('cx', cx)` + `return { provide: { cx } }`。init/install 任一抛错则 provide 不执行 → 所有 `inject('cx')` 为 undefined → `render-component` 在 setup 读 `cx.hooks` 崩溃（表现为整 app `Cannot read properties of undefined (reading 'hooks')`）。这是排查「整页 500」的第一线索。

## 6. 测试范式

- **物料 smoke**（`packages/<pkg>/tests/materials.test.ts`）：根 `vite.config.ts` 的 `test.include` 自动收集 `packages/*/tests/**/*.test.ts`，env `happy-dom`，setup `playground/tests/setup.ts`。
  挂载桩（cx 渲染器把 cmpt 当 prop 注入，测试需手动构造）：
  ```ts
  const fakeCmpt = (key) => ({ id: `test-${key}`, key, data: {}, components: {} })
  const mountMaterial = (cmpt, props = {}) =>
    mount(cmpt, {
      props: { cmpt: fakeCmpt(cmpt._cx_meta?.key || 'x'), ...props },
      global: {
        directives: { cx: { mounted() {} } },
        provide: { cx: undefined, 'is-cx-edit': false, 'is-cx-debug': false },
      },
    })
  ```
- **契约测试**：`_cx_meta` 真、`typeof _cx_install === 'function'`、key 匹配 `^cx-<lib>-[a-z0-9-]+$`、key 唯一、`bundle.materials.length === CxXxx.length`。
- **cx-bundles 测试**（`playground/tests/cx-bundles.test.ts`）：直接 `import { cxBundles } from '../.nuxt/cx-bundles.mjs'`
  （前置 `nuxi prepare`；根 vite alias 把 `#build/cx-bundles.mjs` 指到 `playground/.nuxt/`）。断言每个 bundle 自描述完备、注册次数=物料总数、重复 key 仅白名单 `['cx-skeleton']`。
- **分类完备性测试**：`groupByCategory` 不抛错 + 官方清单 ↔ 物料 key 双向差集为空（见 playbook §7）。
- **重依赖组件**（leaflet/chart.js/shiki 等）：happy-dom 无 canvas/真实布局/异步 WASM，只做契约断言，视觉交浏览器——别写会假绿或假红的渲染断言。

## 7. 命令速查

```bash
pnpm install                                  # 新增 workspace 包后链接
pnpm -F @lionad/cx-comps-<lib> build     # vp pack + vue-tsc（产 dist/index.mjs + d.ts）
pnpm -F @lionad/cx-comps-<lib> typecheck # vue-tsgo --noEmit
pnpm -F @lionad/cx-nuxt build                 # nuxt-module-build build（改了 module.ts 后必跑）
pnpm -C playground exec nuxi prepare          # 改 materials 开关后刷新 #build/cx-bundles.mjs
pnpm exec vp test <path>                      # 单文件/单包测试（pnpm test 不接受位置参数，用 vp test）
pnpm test                                     # 全量（加超时；非 TTY 默认 run 模式）
pnpm typecheck                                # 全仓
pnpm check                                    # fmt+lint+typecheck；pnpm check --fix 统一格式化
```

> 注意：playground 经 dist 消费物料包与 cx-nuxt，所以「改源码后想在浏览器看到」= 重建对应 dist + （改开关则）prepare + （dev server 需重启/重载，见 playbook §9 的时序竞态）。
