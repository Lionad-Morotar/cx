# 转换 Playbook（可复制模板）

> 把 `<lib>` 替换为目标库标识（如 `vtu`），`<Name>` 为组件 PascalCase，`<name>` 为 kebab。
> 机制原理见 `cx-material-system.md`；vtu 的具体取值见 `vtu-case-study.md`。

## §1 包骨架

目录形态（每物料一个目录，**必有** `index.ts` + `src/index.vue`；按需加 `slots/`/`types/`/`panel/`）：

```
packages/components-<lib>/
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── vite.config.ts
├── README.md
├── src/
│   ├── index.ts                 # 桶 + CxXxx 数组 + CxXxxBundle
│   ├── shared/use-<lib>-props.ts  # 通用 attrs 提纯 composable（§4）
│   └── <name>/
│       ├── index.ts             # normalize 定义（§3）
│       └── src/index.vue        # 包装 SFC（§2）
└── tests/materials.test.ts      # §7
```

`package.json`（复刻 `packages/components`，改 name/deps）：

```json
{
  "name": "@lionad/cx-components-<lib>",
  "version": "0.1.0",
  "type": "module",
  "sideEffects": false,
  "main": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": { ".": { "types": "./dist/index.d.ts", "import": "./dist/index.mjs" } },
  "publishConfig": { "access": "public" },
  "scripts": {
    "build": "vp pack && vue-tsc -p tsconfig.build.json",
    "typecheck": "vue-tsgo --tsdk ../../node_modules/.pnpm/typescript@7.0.2/node_modules/typescript --noEmit"
  },
  "dependencies": {
    "@lionad/cx-definition": "workspace:*",
    "@lionad/cx-vue": "workspace:*",
    "<被包装库 npm 名>": "^<version>",
    "lodash-es": "^4.18.1",
    "zod": "^4.4.3"
  },
  "peerDependencies": { "@vueuse/core": "^13.0.0 || ^14.0.0", "vue": "^3.5.0" }
}
```

> 仅当本包自己有 `<style>` 产物时才加 `"./style.css": "./dist/style.css"` 到 exports；纯薄包装层（样式来自被包装库）**不要**加。

`tsconfig.json`：

```json
{ "extends": "../../tsconfig.base.json",
  "compilerOptions": { "rootDir": "src", "types": ["node"] },
  "include": ["src/**/*.ts", "src/**/*.vue"] }
```

`tsconfig.build.json`：在上面基础上加 `"noEmit": false, "declaration": true, "emitDeclarationOnly": true, "outDir": "dist"`。

`vite.config.ts`（`neverBundle` 外置 vue/cx 包/**被包装库**——保持共享、减小体积）：

```ts
import { defineConfig } from 'vite-plus'
import Vue from 'unplugin-vue/rolldown'
export default defineConfig({
  pack: {
    plugins: [Vue({ isProduction: true })],
    dts: false,
    deps: { neverBundle: ['vue', '@vue/shared', '@vueuse/core',
      '@lionad/cx-definition', '@lionad/cx-vue', '<被包装库 npm 名>'] },
  },
})
```

## §2 包装 SFC（通用形态）

```vue
<template>
  <LibComponent v-bind="vtuProps" :class="ns.b()" />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { LibComponent } from '<被包装库>'
import { useCxBEM } from '@lionad/cx-vue'

import { useVtuProps } from '../../shared/use-vtu-props' // 改名为你库的 composable

import type { LibComponentProps } from '<被包装库>'

defineOptions({ name: 'CxLibName', inheritAttrs: false })

const ns = useCxBEM('lib-name')
const vtuProps = useVtuProps<LibComponentProps>(useAttrs(), 'cx-lib-name')
</script>
```

要点：

- `inheritAttrs: false` + 显式 `v-bind`：阻止 cx 内部键自动 fallthrough 到被包装组件根 DOM。
- 块顺序遵循 cx 约定 `<template>` → `<script setup lang="ts">` → `<style>`；`defineOptions.name` 与 key 的 PascalCase 一致。
- **不要** `defineProps` 声明业务 props（cx 把 data 当 attrs 灌入，用 `useAttrs` 接；且 Guard 恒真，见 system §2）。

## §3 normalize 定义 + props 映射策略

```ts
import { normalize } from '@lionad/cx-definition'
import component from './src/index.vue'

export default normalize({
  name: '中文名',
  description: '一句话描述',
  key: 'cx-lib-name',
  icon: 'i-tabler-xxx',
  component,
  props: { /* 见下 */ },
})
```

**映射哲学**：可 authored 的**标量** → 编辑器控件；**结构化数据**（数组/嵌套对象）→ `type: 'json'` + **函数** initial。

| 被包装库 prop 形态 | cx 控件 | 备注 |
|---|---|---|
| string（短） | `short` | `initial: '示例'` |
| string（长/代码） | `textarea` / `code` | |
| number | `number` | `initial: 0` 合法（非 undefined 即纳入） |
| boolean | `switch` | |
| 枚举字面量 | `card-selector`（带 `isPreview:true` + `options:[{label,value}]`）或 `select` | |
| 数组/对象 | `json` | **`initial: () => [...]`**（必须函数） |
| icon 名 | `icon` | |
| 颜色 | `color` | |
| 需 bespoke 编辑器 | `custom`（配 `component` 面板） | 复杂才用 |

**避免键名冲突**：若编辑器专用键与被包装组件同名 prop 冲突，用 `_` 前缀（composable 会剥离 `_` 前缀键，不透传）。

**emits**：v1 可暂不声明（wrapper 无 `defineEmits` 时 Guard 的 emits 子检查不恒真，声明反而可能编译报错）。需要事件能力时，wrapper 加 `defineEmits([...])` 并在模板桥接被包装库事件，再在 meta 声明对应 emits（schema 用 zod）。

## §4 通用 attrs 提纯 composable

29 个组件共用同一逻辑，抽成一个 composable（小接口深实现）：

```ts
import { computed } from 'vue'
import type { ComputedRef } from 'vue'
import type { CxComponentRuntime } from '@lionad/cx-definition'

/**
 * 把 cx 渲染器经 attrs 灌入的 data 提纯为被包装组件 props。
 * 剥离 cx 内部键：cmpt（运行时节点）、data-*（编辑器选区标记）、_ 前缀（编辑器专用键）。
 * 保留 class/style（cx 编辑器样式 + 被包装组件根类合并）。
 * id 缺省回退 cmpt.id：多数库 id 必填，且保证同页多实例唯一。
 * 用 `||` 而非 `??`：空串 id 对多数库非法，`||` 能兜底（`??` 会让空串漏过）。
 */
export function useVtuProps<T extends object>(
  attrs: Record<string, unknown>,
  fallbackId: string,
): ComputedRef<T & { id: string }> {
  return computed(() => {
    const rest: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(attrs)) {
      if (key === 'cmpt' || key.startsWith('data-') || key.startsWith('_')) continue
      rest[key] = value
    }
    const cmpt = attrs.cmpt as CxComponentRuntime | undefined
    rest.id = (rest.id as string | undefined) || cmpt?.id || fallbackId
    return rest as T & { id: string }
  })
}
```

> 命名 `useVtuProps` 是 vtu 案例的；换库时改成 `use<Lib>Props`。若你的库**没有**必填 id，可去掉 id 回退分支。
> 若你想让 cx 编辑器选区标记也落到 DOM（编辑器集成场景），则**不要**剥离 `data-cx-cmpt-*`——按需调整剥离集合。

## §5 逐类型组件配方（json initial 样本必须满足目标库 zod）

为每个组件构造 initial 前，**读目标库该组件的 schema**，特别注意 `superRefine`/判别联合/范围约束。常见坑：

- **判别联合 format**：如 `{ kind: 'currency', currency: 'CNY' }`、`{ kind: 'boolean' }`——`kind` 字面量必须对，缺字段会校验失败。
- **范围/不变量**：slider 的 `max > min` 且 `value ∈ [min,max]`；地图 `lat∈[-90,90]`、`lng∈[-180,180]`；图库 item `width>0 && height>0`；图表 data 行须含 `xKey` + 各 series key 且为有限数；选项列表 `minSelections ≤ maxSelections`。
- **url 字段**：用合法 `https://...`（picsum.photos 等占位图可用）；有的库 url 还 refine 必须 http(s)。
- **嵌套必填**：如天气 `location.name` + `units.temperature` + `current{conditionCode,temperature,tempMin,tempMax}` + `forecast[]{label,conditionCode,tempMin,tempMax}` 全必填。

样本目标：**最小但有效**，让验收卡渲染出有意义的真实内容。

## §6 cx-nuxt 注册

`packages/nuxt/src/module.ts` 三处：

```ts
export type CxBuiltinMaterialSet = 'render' | 'components' | 'nuxt-ui-v2' | 'nuxt-ui-v4' | '<lib>'
// BUILTIN_BUNDLES 加：
  <lib>: { package: '@lionad/cx-components-<lib>', namedExport: 'CxLibBundle' },
// setup 内条件样式注入（仿 v-calendar）：
if (options.injectStyles && specs.some((s) => s.package === '@lionad/cx-components-<lib>')) {
  nuxt.options.css.push('<被包装库 style 入口，如 @lionad/<lib>/style.css>')
}
```

> 改完 module.ts **必须** `pnpm -F @lionad/cx-nuxt build`（playground 消费 dist）。

## §7 playground 接入 + 验收页 + 分类契约

1. `playground/package.json` dependencies 加 `"@lionad/cx-components-<lib>": "workspace:*"`（**必须**——虚拟模块在宿主上下文解析）。
2. `playground/nuxt.config.ts` 的 `materials` 数组加 `'<lib>'`。
3. `playground/app/dev/<lib>-categories.ts`：`CATEGORY_ORDER` + `OFFICIAL_KEYS`（目标库官方分类清单）+ `CATEGORY_BY_KEY`（**一次性建全所有 key 映射**，增量安全）+ `groupByCategory`（未映射 key **抛错**）。
4. `playground/app/pages/dev/components-<lib>.vue`：复刻 v4 页——`import { CxLib }` → `materials.map(toItem)` → `groupByCategory` → 每组 `<CxRender v-if="!item.meta.headless" :components="[item.node]" />`。预览容器加 `max-height + overflow:auto` 收口高物料。
5. `app/pages/dev/index.vue` + `app/components/dev-pages-nav.vue` 各加一条链接。
6. `playground/tests/<lib>-categories.test.ts`：

```ts
it('官方清单与物料 key 集双向相等', () => {
  const materialKeys = new Set((CxLib as any[]).map((m) => m._cx_meta.key.replace(/^cx-<lib>-/, '')))
  const officialKeys = new Set<string>(OFFICIAL_KEYS) // 注意 Set<string> 否则 .has(string) 类型报错
  expect([...materialKeys].filter((k) => !officialKeys.has(k))).toEqual([])
  expect([...officialKeys].filter((k) => !materialKeys.has(k))).toEqual([])
})
it('groupByCategory 全覆盖不抛错', () => {
  const groups = groupByCategory((CxLib as any[]).map(toItem))
  expect(groups.reduce((s, g) => s + g.items.length, 0)).toBe((CxLib as any[]).length)
})
```

## §8 样式集成（首要风险，先实证）

被包装库样式分三类，处理不同：

- **自带编译好的 css**（utility 已内含）：cx-nuxt 条件注入即可，浏览器直接看效果。
- **Tailwind v4 `@source` 形态**（utility 由消费方扫描生成，如 vtu）：cx-nuxt 注入其 `style.css`，**依赖宿主 Tailwind v4 处理 `@source`** 扫描被包装库 dist 生成 utility。必须在浏览器实证——看不到样式 = utility 没生成，备选在宿主 `main.css` 显式 `@source "<被包装库 dist 路径>"`。
- **依赖运行时 JS 注入样式**：按被包装库要求，必要时在物料包运行时注入（参考 v4 的 ui replacer 经验）。

> 验收页**截图**是唯一可信证据；curl 200 只证明壳，不证明样式。

## §9 构建/验证工作流（含 dev server 时序竞态）

- 新建/改物料包后：`pnpm install`（链接）→ 改完源码 `pnpm -F @lionad/cx-components-<lib> build`（playground 吃 dist）。
- 改 materials 开关后：`pnpm -C playground exec nuxi prepare`（刷新 `#build/cx-bundles.mjs`）。
- **dev server 时序竞态**：重启 dev server 后，Vite 首次请求才触发依赖预优化（重依赖库优化耗时长）；**优化完成前**访问页面会 `Failed to fetch dynamically imported module ...entry.js` 或整页 500。
  自动化截图前**轮询 dev log 的 `dependencies optimized`** 再导航；导航前可先 `navigate about:blank` 丢弃旧 module graph 避免粘住失效 `?v=` hash。
- 验证顺序：包测试 → 全量 `pnpm test`（加超时）→ `pnpm typecheck` → `pnpm check --fix` → 浏览器实证 → 重建 dist。

## §10 git：macOS 大小写陷阱

case-insensitive FS 上 `git add WRONGCASE.md`（磁盘为 `RightCase.md`）会触发 case-rename 混淆：编辑不进 commit、工作树「假 modified」。
诊断：`git ls-files | rg -i '^rightcase.md$'` 看索引真实大小写；`git show HEAD:<file>` 看已提交内容是否含你的编辑。
修复：用**磁盘一致的大小写** `git add RightCase.md` 后 `git commit --amend --no-edit`。

## §11 分批提交（垂直切片，每 commit 可独立构建/测试）

推荐顺序：① 既有格式化漂移单独 `style:` → ② `feat(components-<lib>): 新物料包`（含 `pnpm-lock.yaml`，lockfile 与可解析的新包同 commit）→
③ `feat(cx-nuxt): 注册 + 样式注入` → ④ `feat(playground): 验收页 + 分类契约` → ⑤ `docs: 依赖链/包清单`。
