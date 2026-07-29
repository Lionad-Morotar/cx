---
name: convert-to-cx-materials
description: |
  把一个 Vue 组件库（外部 npm 包或内部包，如 Nuxt UI、tool-ui-vue/vtu、Element 等）转换为 cx 渲染系统
  （@lionad/cx-render / cx-definition / cx-vue / cx-nuxt）能直接装配、渲染、验收的「物料包（material bundle）」。
  覆盖：调研目标库 → 建包骨架 → 逐组件包装为 normalize 物料 → 接入 cx-nuxt + playground 验收页 → 全量验证。

  使用场景：
  - 用户说"把 X 组件库接进 cx / 做成 cx 物料 / 新建 packages/comps-<lib>"
  - 用户要把一个 UI 库的组件变成低代码编辑器可拖拽、可配置、可 schema 渲染的物料
  - 已有物料包要新增/补齐组件，或要对齐既有 comps / comps-nuxt-ui-v2 / v4 / vtu 的模式

  触发关键词：cx 物料、material bundle、normalize、CxMaterialBundle、comps-vtu、comps-nuxt-ui、
  组件库转物料、包装组件、convert-to-cx-materials
argument-hint: <组件库名或路径>
disable-model-invocation: true
---

# 把组件库转换为 cx 物料

> 本 SKILL 只给流程骨架 + 不可违反的不变量。cx 的契约/运行时细节、可复制的文件模板、
> 以及 vtu 这次转换的实战经验，全部渐进式披露在 `references/`，按需读取，不要一次全读。

## 先建立心智模型（30 秒）

cx 是 schema 驱动渲染系统：消费方给一棵 `CxComponentRuntime` 树，`<CxRender>` 递归渲染成真实组件树。
你要做的「物料包」就是向这套系统注册一组可渲染组件。三个等价事实：

- **一个物料** = `normalize({ key, name, description, icon, component, props, emits?, slots? })` 的返回值。
  它既是 Vue 组件（`component` 这个包装 SFC），又挂着 `_cx_meta`（编辑器元信息）与 `_cx_install`（注册函数）。
- **一个包装 SFC** = 把 cx 灌进来的 data 翻译给被包装组件、把事件翻译回来的薄层。它不含业务样式，样式来自被包装库。
- **一个物料包** = 入口导出 `CxXxx` 数组 + `CxXxxBundle: CxMaterialBundle { name, materials }`，并被 `@lionad/cx-nuxt` 按开关装配。

> 深读 cx 契约与运行时数据流：[`references/cx-material-system.md`](references/cx-material-system.md)

## 工作流（6 阶段）

每阶段标出该读哪个 reference。S1（地基）必须先跑通端到端单组件，再批量铺量——这是本流程最重要的纪律。

1. **调研目标库**：枚举全部组件、每个组件的 props/slots/emits、是否 zod 契约、样式如何分发（自带 css？Tailwind？token？）、
   重依赖（地图/图表/高亮）是否 external、发布形态（npm 版本 vs 本地 link）。
   _决策点_：依赖用 npm 发布版（干净、可发布）还是本地 link（跟踪实时改动）。
2. **建包骨架**：`packages/comps-<lib>/` 复刻 `packages/comps` 的形态（package.json / tsconfig / tsconfig.build / vite.config）。
   物料 key 用版本化前缀 `cx-<lib>-<name>`，避开既有 `cx-*` / `cx-nuxt-ui-v4-*` 命名空间。
   _模板_：[`references/conversion-playbook.md` §1-2](references/conversion-playbook.md)
3. **S1 地基（端到端单组件，含样式实证）**：挑一个简单且标志性的组件，做完包装 SFC + normalize + bundle + cx-nuxt 注册 +
   playground 接线 + 验收页骨架，并在浏览器看到它带样式渲染。样式集成是首要风险，必须在此实证，不通过不铺量。
4. **批量铺量（按目标库官方分类切 Slice）**：每个组件 = 包装 SFC（复用同一 composable）+ normalize（props 映射 + 合规 initial 样本）。
   结构化数据 props 的样本必须满足目标库 zod 的全部不变量（否则预览空白/DEV 告警）。
   _props 映射策略 + 包装 composable + 逐类型配方_：[`references/conversion-playbook.md` §3-5](references/conversion-playbook.md)
5. **接入宿主**：cx-nuxt 注册（联合类型 + bundle 映射 + 样式条件注入）+ playground（workspace 依赖 + materials 启用 + 验收页 +
   分类文件 + 分类完备性测试）。分类用「未映射 key 抛错」+「官方清单 ↔ 物料 key 双向差集」两道契约锁死。
   _模板_：[`references/conversion-playbook.md` §6-7](references/conversion-playbook.md)
6. **验证**：包测试（契约 + 可干净挂载者的 smoke）→ 全量 `pnpm test` → 全仓 `pnpm typecheck` → `pnpm check`（含 `--fix`）→
   浏览器实证全量物料带样式渲染 → 重建 dist。

## 不可违反的不变量（违反=静默失败，先读这里）

这些是本次转换踩实、且与直觉相悖的点。编码前先内化，细节见 references 对应章节。

1. **json/对象/数组 props 的 `initial` 必须是函数** `initial: () => [...]`，不能写字面量——cx 的 `Initial` 类型对字面量报错，
   且 `buildDefaultData` 对函数会调用取值。（playbook §3）
2. **包装 SFC 用 `inheritAttrs:false` + 显式 `v-bind`**，并剥离 cx 内部键（`cmpt` 节点、`data-*` 编辑标记、`_` 前缀编辑器键），
   否则这些键会泄漏到被包装组件根 DOM；id 缺省要回退 `cmpt.id`（多数库 id 必填）。（playbook §4）
3. **`normalize` 的编译期 Guard 对「包装组件空 `defineProps<{}>()` + 丰富 meta.props」恒真**——因为 SFC 类型不匹配构造签名使
   `ComponentProps=never`。所以放心用 `useAttrs()` 模式，别为过 Guard 去声明 props。（cx-material-system §3）
4. **样式集成先实证**：被包装库若用「消费方扫描生成 utility」（如 Tailwind v4 `@source`），须经 cx-nuxt 条件注入其 css 并由宿主 Tailwind 处理；
   浏览器看到正确样式前，不宣告完成。（playbook §8）
5. **改 `packages/nuxt/src` 或新建/改物料包后，playground 消费的是 dist**——必须重建对应包 dist；改了 materials 开关后
   `nuxi prepare` 刷新虚拟模块 `#build/cx-bundles.mjs`。（playbook §9）
6. **macOS 大小写不敏感 FS 的 git 陷阱**：`git add` 的文件名大小写必须与磁盘一致，否则编辑不进 commit 且工作树「假 modified」；
   用 `git ls-files` 看索引真实大小写诊断。（playbook §10）

## 渐进披露地图（按需读，勿全读）

| 你需要                                                                                                                                             | 读                                                                       |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| cx 物料契约、运行时数据流、Guard 原理、bundle 装配机制、测试范式                                                                                   | [`references/cx-material-system.md`](references/cx-material-system.md)   |
| 包骨架/包装 SFC/normalize/composable/cx-nuxt/验收页/分类/测试的可复制模板 + props 映射配方 + 构建/验证命令                                         | [`references/conversion-playbook.md`](references/conversion-playbook.md) |
| 把 tool-ui-vue(vtu) 转成 `comps-vtu` 的实战案例：useVtuProps 设计、@source 样式集成、json 函数坑、dev server 时序竞态、SSR 边界、事件桥接取舍 | [`references/vtu-case-study.md`](references/vtu-case-study.md)           |

> 转换非 vtu 库时，`vtu-case-study.md` 当作「别人踩过的坑」的清单快速扫一遍即可，不必照搬其 composable 命名。

## 验证清单（交付前逐项打勾）

- [ ] 每个物料 `_cx_meta` + `_cx_install` 完备，key 唯一且匹配 `^cx-<lib>-[a-z0-9-]+$`
- [ ] `CxXxxBundle.materials.length` == 目标库组件数；分类测试双向差集为空
- [ ] 结构化 props 的 initial 样本在目标库 zod 下 `safeParse` 通过（无 DEV 告警、预览非空）
- [ ] 包测试绿 + 全量 `pnpm test` 绿 + 全仓 `pnpm typecheck` 绿 + `pnpm check` 0 errors
- [ ] `vp pack` 产 dist；playground 验收页浏览器实证全量物料带样式渲染
- [ ] 重依赖组件（地图/图表/高亮）在 happy-dom 仅做契约断言，视觉交浏览器（不做假绿断言）
- [ ] 文档同步：根 README 包表 + `.planning/codebase/{STRUCTURE,ARCHITECTURE}.md` 依赖链/子包计数 + 根 `AGENTS.md`
