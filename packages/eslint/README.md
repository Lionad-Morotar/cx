# @lionad/cx-eslint-config

cx monorepo 共享 ESLint flat config，也可被下游项目直接复用。

## 用法

```js
// eslint.config.mjs
import cx from '@lionad/cx-eslint-config'

export default cx
```

需要追加项目级忽略（产物目录、vendor 源码等）时用工厂：

```js
import { createConfig } from '@lionad/cx-eslint-config'

export default createConfig({
  ignores: ['packages/foo/vendor/**'],
})
```

## 规则集构成

| 层 | 来源 | 作用 |
| --- | --- | --- |
| 忽略 | 内置 + `options.ignores` | `dist` / `coverage` / `.nuxt` / `.output` 及项目追加项 |
| JS 推荐 | `@eslint/js` recommended | 全部文件 |
| TS 推荐 | `typescript-eslint` recommended | ts 家族 + `.vue`（SFC 脚本） |
| Vue 推荐 | `eslint-plugin-vue` flat/recommended | `.vue` |
| 微调 | 内置 | `no-unused-vars` 允许 `_` 前缀；关闭 `vue/multi-word-component-names`（Nuxt 路由页豁免） |
| Vitest | `@vitest/eslint-plugin` recommended | `*.test.*` 与 `tests/` |
| 格式关闭 | `eslint-config-prettier` | 收尾层：格式一律归 Oxfmt，ESLint 不管 |

## 定位：与 Oxlint 并存

- `vp check`（Vite+ 内置 Oxlint）：快速语法检查，随构建链路跑。
- 本 config：Vue / TS / Vitest 生态完整规则，`pnpm lint` 独立跑。

两者规则重叠处以 ESLint 为准；禁用注释统一用 `// eslint-disable-next-line <rule-id>` 行内形式。

## 已知约束

本包把 `typescript` 解析重定向到 `npm:typescript@^6`（见 `package.json` dependencies）。
原因：`typescript-eslint` 8.x 不支持 TS 7.0（加载即抛错，tracking typescript-eslint#10940），
而仓库 typecheck 走 tsgo/vue-tsgo（TS 7），lint 仅需 TS 的 JS API。
上游支持 TS >= 7.1 落地后移除此 alias。
