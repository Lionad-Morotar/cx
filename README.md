# cx

Schema 驱动的 Vue 渲染系统：从低代码组件定义（schema）到运行时渲染的完整链路。

## Packages

| 包                                                                   | 说明                                                       |
| -------------------------------------------------------------------- | ---------------------------------------------------------- |
| [`@lionad/cx-definition`](packages/definition)                       | schema 层：组件 meta 类型系统、normalize、loader、事件总线 |
| [`@lionad/cx-vue`](packages/vue)                                     | Vue 运行时：composables、共享运行时组件                    |
| [`@lionad/cx-render`](packages/renderer)                             | 渲染器：递归渲染 schema 为 Vue 组件树                      |
| [`@lionad/cx-components`](packages/components)                       | 基础物料组件库                                             |
| [`@lionad/cx-components-nuxt-ui-v2`](packages/components-nuxt-ui-v2) | Nuxt UI 物料组件库                                         |
| [`@lionad/cx-nuxt`](packages/nuxt)                                   | Nuxt module：零配置集成                                    |

## 开发

```bash
pnpm install        # 安装依赖
pnpm build          # 构建全部包（vp run，依赖拓扑排序 + 缓存）
pnpm test           # 运行测试（vitest）
pnpm check          # fmt + lint + 类型检查
pnpm dev:playground # 启动 playground（LAN 暴露）
```

工具链：[Vite+](https://viteplus.dev)（Vite 8 / Vitest / Oxlint / Oxfmt / tsdown）+ TypeScript 7（tsgo / vue-tsgo）。

## License

MIT
