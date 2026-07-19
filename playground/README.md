# cx playground

cx monorepo 的能力验收环境：**Schema 驱动渲染 demo + EAP 站会管理（迁移版）**。

## 启动

```bash
# 根目录
pnpm dev:playground
# 或本目录
pnpm dev
# 打开 http://localhost:3209（LAN 已暴露）
```

## 内容区

| 路由                                       | 内容                                                         |
| ------------------------------------------ | ------------------------------------------------------------ |
| `/`                                        | 首页：站会入口 + 基础物料 schema 渲染 + 迁移物料 schema 渲染 |
| `/standup/list?type=day`                   | 日会列表（按周分组、开会流程、成员拖拽排序）                 |
| `/standup/list?type=week`                  | 周会列表（按月分组、最后工作日标记）                         |
| `/standup/dashboard/daily?standupID=<id>`  | 日会看板（三卡、todo 编辑器、7 过滤器、成员选择器）          |
| `/standup/dashboard/weekly?standupID=<id>` | 周会看板（本周/下周 tabs、13 项指标卡、issues 表格）         |

## Mock 层

- 全部 API 走 Nuxt server routes（`/api/**`），**零外网依赖，断网可完整运行**
- 数据由脚本批量生成（虚构词库，无任何真实业务信息）：

```bash
pnpm gen:mocks        # 重新生成 mocks/data/*.json（以当日为锚，同日幂等）
```

- 写操作（开会/结束/参会人/备忘/改标题/同步）走 server 内存态；**nitro 热重载或重启后重置为种子数据**
- 数据契约与再生成说明见 `mocks/README.md`

## 目录结构

```
app/
├── pages/                  # Nuxt 文件路由（薄壳）
├── plugins/                # Element Plus / 站会域装配 / 物料注册 / iconfont
├── standup/                # EAP 站会功能域（迁移本体）
│   ├── views/              # 页面级组件
│   ├── components/         # 25 个 normalize 物料 + 域内组件
│   ├── states/ apis/ hooks/ utils/ styles/ assets/
├── app.vue                 # NuxtPage 壳
├── app.config.ts           # ui.colors 等 vendored 物料配置兜底
server/api/                 # Mock 层路由（16 读 + 8 写 + avatar）
server/utils/mock-store.ts  # 种子加载 + 内存态写层
mocks/data/                 # 生成产物（入库，开箱即用）
scripts/generate-mocks.mjs  # 批量数据生成脚本
tests/                      # vitest（根 pnpm test 统一跑）
```

## 站会物料的 schema 渲染

25 个迁移物料（`cx-dashboard-card`、`cx-todo-card`、`cx-user-select` 等）经
`app/plugins/standup-materials.ts` 注册进 CxLoader，可被 `<CxRender :components>`
以 schema 驱动渲染（首页演示区可见 `cx-dashboard-card` 实例）。
