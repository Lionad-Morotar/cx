# Packages

cx monorepo 子包一览。依赖链方向：definition → vue → renderer → comps-\* → nuxt。

| 包                  | 作用                                                     |
| ------------------- | -------------------------------------------------------- |
| definition          | schema 层：组件元类型、normalize、loader、事件与钩子内核 |
| vue                 | Vue 运行时：composables 与共享运行时组件                 |
| renderer            | schema 驱动的 Vue 渲染器                                 |
| stream              | 流式渲染管线：增量解析 LLM 不完整 JSON 为可渲染组件树    |
| comps               | 基础物料（通用组件、ECharts)                             |
| comps-vtu           | vtu(tool-ui-vue)tool-call 物料包装                      |
| comps-element-plus  | Element Plus 物料包装                                    |
| comps-naive-ui      | Naive UI 物料包装                                        |
| comps-nuxt-ui-v2    | Nuxt UI v2 物料（vendored 组件实现）                     |
| comps-nuxt-ui-v4    | Nuxt UI v4 物料包装                                      |
| nuxt                | Nuxt 模块集成                                            |
| eslint              | 共享 ESLint flat config                                  |
| skills              | Agent 技能包（非 npm 包）                                |

依赖治理约定：宿主 UI 库(element-plus、naive-ui、echarts、@iconify/vue、vtu、@nuxt/ui)一律声明为 peerDependencies,devDependencies 保留本地构建副本,使宿主库升级与 cx 发版解耦。
