# 案例：tool-ui-vue (vtu) → `@lionad/cx-comps-vtu`

> 本次会话把 vtu 转成 cx 物料的实战记录。当作「别人踩过的坑 + 已验证的取值」清单。
> 通用模板在 `conversion-playbook.md`，cx 机制在 `cx-material-system.md`。

## 目标库画像

- vtu = `tool-ui-vue`（`@lionad/vtu-components@0.3.6`，已发布 npm 且与本地 monorepo HEAD 一致）。
- **29 个工具组件，纯 props 驱动、零 slot**（仅 core 的 Button/Card/Badge 有默认 slot——core 与 cx 既有物料重叠，不包装，scope 只取 29 工具组件）。
- 统一契约：扁平 props + `css` 覆盖对象 + zod `SerializableXxxSchema` + 双事件机制（Vue emits 与 `onX` 回调并存）+ i18n 默认 zh-CN。
- 构建 ESM+CJS+dts；`style.css = @source "." + tokens.css + vtu-components.css`；重依赖（leaflet/chart.js/shiki/marked/diff/ansi-to-html/lucide）external，随包传递安装。
- 6 官方分类（histoire storyGroups）：Data Display / Code & Terminal / Media / Social / Forms & Input / Workflow。

## 关键决策

- **依赖**：npm 发布版 `@lionad/vtu-components@^0.3.6`（干净、可发布、与本地一致；未用跨仓 link）。
- **key 前缀**：`cx-vtu-<name>`。
- **样式**：vtu 是 Tailwind v4 `@source` 形态 → cx-nuxt 启用 vtu 时 `nuxt.options.css.push('@lionad/vtu-components/style.css')`，由 playground 的 Tailwind v4 扫描 vtu dist 生成 utility。浏览器实证生效（见下「验证证据」）。
- **事件桥接（v1 未做）**：29 物料均未在 wrapper 声明 `defineEmits`/桥接 vtu 交互事件。物料可渲染、可配置，但 OptionList/PreferencesPanel/ParameterSlider 的 change/action、post 的 onAction 等暂不接入 cx 事件系统——留待后续切片（需 wrapper 加 defineEmits 并验证 Guard 对 emits 的兼容性，见 system §2 末尾）。

## 包装 composable：`useVtuProps`

vtu 组件普遍必填 `id`，且 cx 灌入的 attrs 含 `cmpt`/`data-*`/无 `_` 前缀冲突（vtu 29 组件无下划线前缀 prop，故 `_` 剥离是纯防御、不误伤）。composable 见 playbook §4，vtu 的具体选择：

- 剥离集合 = `{cmpt} ∪ data-* ∪ _*`；保留 class/style。
- id 回退用 `||`（空串兜底，因 vtu id 必填且非空）。

## props 映射取值样例

- **标量为主**（Terminal）：`command:short`、`exitCode:number`、`stdout/stderr:textarea`、`durationMs:number`、`cwd:short`、`truncated:switch`。
- **结构化 → json + 函数 initial**：
  - DataTable：`columns: () => [{key,label,sortable?},{key,label,format:{kind:'boolean'}}]`、`data: () => [{...行}]`。
  - Chart：`series: () => [{key,label}]`、`data: () => [{ <xKey>, <seriesKey>: 有限数 }]`（superRefine 要求每行含 xKey+series key 且有限数）。
  - StatsDisplay：`stats: () => [{key,label,value,format:{kind:'currency',currency:'CNY'},diff:{value},sparkline:{data:[≥2 数]}}]`。
  - WeatherWidget：`location/units/current/forecast` 全 json，`current` 含 `conditionCode` 枚举 + 温度三值，`forecast[]` 含 label+conditionCode+tempMin+tempMax。
  - GeoMap：`markers: () => [{lat∈[-90,90], lng∈[-180,180], label}]`。
  - ParameterSlider：`sliders: () => [{id,label,min,max,step,value}]`（max>min 且 value∈区间）。
  - PreferencesPanel：`sections: () => [{heading, items:[{id,label,type:'switch'}]}]`（用 switch 最简；toggle 需 options≥2、select 需 selectOptions≥5）。
  - QuestionFlow：`steps: () => [{id,title,options:[{id,label}],selectionMode}]`（upfront 模式，options≥1）。
  - 三个 post（x/instagram/linkedin）：`post: () => ({id, author:{name,handle,avatarUrl}, text})`——注意 x-post 的 `author.avatarUrl` 须是合法 url（z.url()），instagram/linkedin 的 avatarUrl 是普通 string。

## 踩坑清单（按代价排序）

1. **json initial 写成字面量** → TS 报 `Type 'X[]' is not assignable to type 'Initial | undefined'`。改 `initial: () => [...]`。首批 json 全中此坑。
2. **dev server 时序竞态** → 重启后首次访问 `Failed to fetch dynamically imported module .../entry.js?v=<hash>` 或整页 `Cannot read properties of undefined (reading 'hooks')`（后者实为 init/install 抛错致 provide 未执行，见 system §5）。修法：轮询 dev log 的 `dependencies optimized` 再导航；导航前 `navigate about:blank` 丢弃粘住的失效 `?v=` hash。
3. **整页 500「reading 'hooks'」的根因链**：`render-component.vue` setup 期 `cx.hooks.on(...)`，若 `inject('cx')` 为 undefined 即崩。而 cx 为 undefined 通常是 plugin.client 的 init/install 抛错（或本案例的依赖优化未完成致模块加载失败）使 provide 没执行。排查先看 dev log，而非盯着渲染器。
4. **外部审查用 session-file 灌 37KB 转录** → glm 在超大上下文卡死 0 产出；且前台 Bash 撞 10 分钟硬上限连带杀父进程。修法：target 改用精炼 prompt.md（自包含工作摘要+文件清单），并以后台跑外部审查脚本。
5. **macOS 大小写 git 陷阱**：根文档磁盘为 `Agents.md`，误 `git add AGENTS.md` 致编辑不进 commit、工作树假 modified。用 `git add Agents.md` + `amend` 修。
6. **`pnpm test` 不接受位置参数**（pnpm 12 alpha 的 test 子命令解析器拒绝）→ 单包/单文件用 `pnpm exec vp test <path>`。

## 外部正交审查结论（glm-5.2，light）

- **无高严重度问题**；核心逻辑（useVtuProps 剥离/id 回退、normalize 契约、bundle 注册、分类双向完备性）正交视角无缺陷。
- **1 中价值观察**：vtu 的 SSR 兼容性在 `ssr:false` playground 下未实证。glm 独立静态分析偏安全——`@vue-leaflet/vue-leaflet` ESM 顶层 0 处 window/document、leaflet 为 `import('leaflet')` 动态加载、vtu bundle 含 12 处 `typeof window` 守卫。
- **处置**：采纳为已知限制，不改。理由：cx 本为客户端渲染系统（playground `ssr:false`、renderer setup 依赖 window），SSR 非本任务目标；失败场景需「宿主开 SSR + 未来 vtu 升级引入顶层 window」方成立。后续若需 SSR：跑 `ssr:true` 的 `nuxt build` 实证 + 给重依赖物料加 `<ClientOnly>`/client-only 标记防线。

## 验证证据

- 全量 `pnpm test`：**27 文件 / 172 用例**（含 comps-vtu 18 + vtu-categories 2 + cx-bundles 自动覆盖）绿。
- 全仓 `pnpm typecheck` 绿；`pnpm check` 0 errors。
- 包 `vp pack` 产 dist 40.76kB。
- 浏览器实证 `/dev/components-vtu` 6 分类 29 卡带样式：chart 真实柱状图、shiki 语法高亮+行号+语言徽标、diff +/- 着色、`¥12,800.00 +12.5%` 货币格式 + sparkline、terminal ANSI、markdown 文章（标题/加粗/列表/代码/标签/作者头像）。

## 提交链

```
docs: 依赖链与包清单补 components-vtu
feat(playground): 接入 vtu 验收页与分类契约
feat(cx-nuxt): 注册 vtu 物料集并条件注入样式
feat(components-vtu): 新增 vtu 物料包包装 29 个工具组件
style: vp check --fix 统一格式化收尾
```

## 留给后续

- 交互事件桥接（defineEmits + meta emits，需验证 Guard）。
- vtu 升级时同步本包 + `vtu-categories.ts` 的 `VTU_OFFICIAL_KEYS`/`CATEGORY_BY_KEY`（分类契约测试会暴露漂移）。
- 若需 SSR：实证 + 防线（见上）。
