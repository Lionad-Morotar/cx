# Agents.md

Schema 驱动的 Vue 组件渲染系统：从低代码组件定义（schema）到运行时渲染的完整链路。共 6 个子包，形成 definition → vue → renderer → components → components-nuxt-ui-v4 → nuxt 的依赖链，外加 `playground` 开发沙箱。

- 现实层你有无限时间和资源，不要因上下文压缩简化任务执行
- 本仓库使用 Vite+（Vite 8 / Vitest / Oxlint / Oxfmt / tsdown）作为构建工具链，TypeScript 7 作为类型检查
- 包管理器：pnpm 12.0.0-alpha.14

## 项目上下文

| 文档 | 说明 |
| ---- | ---- |
| [STACK.md](./.planning/codebase/STACK.md) | 技术栈、开发命令、部署流程 |
| [STRUCTURE.md](./.planning/codebase/STRUCTURE.md) | 目录结构、命名规范 |
| [ARCHITECTURE.md](./.planning/codebase/ARCHITECTURE.md) | 架构模式、术语表 |
| [CONVENTIONS.md](./.planning/codebase/CONVENTIONS.md) | 代码风格、开发约定 |
| [TESTING.md](./.planning/codebase/TESTING.md) | 测试规范 |
| [INTEGRATIONS.md](./.planning/codebase/INTEGRATIONS.md) | 外部服务、环境变量 |
| [CONCERNS.md](./.planning/codebase/CONCERNS.md) | 技术债务、注意事项 |

你可以自行读取项目上下文文档，更新时也优先更新相关文档。

## Agent skills

### 领域文档（Domain docs）

Single-context 布局：根 `CONTEXT.md`（领域词汇表）+ `docs/adr/`（架构决策记录）。工程技能（diagnose / tdd / improve-codebase-architecture）探索代码库前先读这两个位置。详见 `docs/agents/domain.md`。
