# 物料深化展示与 Stream 流式改造

> 物料包建成（验收页能渲染）之后的两条成熟度链路：
> variants 深化（验收页全视觉属性对照展示）与 Stream 改造（接入增量渲染管线）。
> 两者独立可并行，在回放链路汇合——variants 即回放剧本。
> 本文以 article 先例推广到 vtu 29 件全量、comps 基础物料 9 件 scalar、及 nuiv4 70 件（19 trigger：scalar 6 + array 8 + region 4 + 组合 1）的实证为蓝本，路径均以 cx monorepo 根为基准。

## 1. 心智模型：两种流式形态

`@lionad/cx-stream` 管线（`packages/stream/src/core/incremental.ts`）按物料数据主体形态分流，
每物料一件声明文件 `packages/comps-vtu/src/<material>/stream-trigger.ts`（其余 comps 包同构）。

数组增长型（array）：数据主体是数组（rows / items / markers …）。
截断点落在主数组元素边界，逐项揭示。

标量主体形态（scalar）：主体是标量或嵌套对象（code / post / body …）。
key 检出即挂载空壳（fallbackData 保契约）、属性闭合即揭示、frameStride 合并短属性扎堆闭合。

区域槽形态（region，nuiv4 首次成组使用）：主体是声明 slots 的槽内 components 树（card 三内容区、
header/footer/sidebar 布局槽）。scanPaths 取自 `Object.keys(def._cx_meta.slots)` 逐槽展开为
`['components', slot, '*']`，槽项完整对象闭合时出帧；声明 slot 计数 0 即从分组剔除，未声明 slot
原样保留。增量帧位于 JSON 尾部（components 序列化在 data 之后），页面观察窗口短，实证需盯帧。

组合形态（combo）：array + region 双 section 共存（footer-columns：columns 数组主字段 +
left/right 两槽），array 字段域与 region 字段域各自按自身语义收敛；scalar 与 array/region 互斥
（compileTrigger 显式 throw）。

先逐件判定形态再动手：schema 里最长、最有内容感的主字段是数组 → array；是字符串 / 对象 → scalar。

comps 包判例（22 件逐件）：9 件 scalar 适用（文本/标题 7 件 + user-style + figure），13 件不适用——
容器物料（block/scrollbar/page/grid）增长的是槽内 components 树而非 data 数组，两种形态都不覆盖；
headless 逻辑物料 8 件无可见 UI；calendar props 全部注释无 data。「容器不适用」是 vtu 没有的判据，
comps 也是「零 array 形态」的整包实证。

nuiv4 包判例（70 件逐件，19 件适用：scalar 6 + array 8 + region 4 + 组合 1）：

- 判定表完备性以「注册数 + 不适用数 = 物料总数」计数校验兜底——button 属 Element 组交互原件，
  「Form 组 21 件」的按组默写漏掉它，19 + 50 = 69 ≠ 70 暴露。
- scalar 与 region 的形态互斥归属：带内容槽物料按答复内容主载体判——alert/banner 主载体是
  data props（schema 驱动场景 LLM 输出 data.title 最自然）判 scalar，card 主载体是三内容区槽判
  region；compileTrigger 对 scalar+array/region 组合显式 throw，互斥契约受保护不可兼得。
- 极短标记类字段（1-3 词 label/text/value）主体性弱排除：badge/chip/kbd/link 同一判据，
  不按官方分类归属判。

机制语义差异（写断言与排查时必须先内化）：

- array 形态截断只认主数组：主数组之后的尾随标量字段不进帧（chart 尾随列推导同款语义），
  尾随字段交给完整帧；空主数组无可切分边界，全程无帧、终态 null（页面 done 态切完整节点兜底），
  vtu 侧未开 emptyPassthrough。nuiv4 判例：table 开了 `stateBranch.emptyPassthrough: true`——
  空数组闭合即透传完整帧（UTable 自带空态接管渲染），回放可见 0 项徽标 + 表头空态，
  variants 应含 `{ data: [] }` 空态透传组与声明语义呼应。
- scalar 形态 frameStride N 按 next() 调用次数（delta 数）计窗，首帧（空壳挂载）不节流，
  被节流内容并入窗口到期后的下一帧；管线对完整 JSON 输入有终态兜底——closureFallback 内
  直试 `JSON.parse(text)`，完整则完整帧无视节流窗口直出，否则末尾扎堆闭合的短字段被窗口压掉、
  流结束后终态停在缺字段中间态。
- 渲染链路不过物料 zod：管线 parse 只有 JSON.parse 与 jsonrepair。
  这一事实决定了 fallbackData 的推导依据（见 §2），也与你直觉相反——先内化。

## 2. scalar 声明三要素

每物料一件 `stream-trigger.ts`，三要素：`fallbackData`、`skeletonFields`、`frameStride`。

### fallbackData：空壳帧的最小 data

推导依据不是 zod，而是物料模板的无守卫直访链：zod 不在渲染链路上（article zod
`content.min(1)` 被 fallback 空串违反却全绿），模板直访路径缺席才 TypeError。

取证法：逐件读物料模板源码或打包产物（dist/index.js 按 region 注释定位编译产物），
把模板碰到的嵌套路径在 fallback 里给空壳。实证判例：

- x-post 模板直访 `post.author.verified`（无守卫）→ fallback 必须含
  `{ post: { author: { name:'', handle:'', avatarUrl:'' } } }`。
- message-draft 判别联合（email/slack）：slack 分支模板直访 `target.type/name`，
  fallback 按分支并集兜底（email 分支不读 target，残留键无害）；channel 必须入 fallback，
  缺席时组件判别即崩。
- z.lazy 自引用（x-post quotedPost）不进 fallback，安全。
- comps 判例（从简）：comps 物料 props 全带 defineProps 默认值（content:''、image:()=>({})），
  模板直访有默认值兜底、渲染链路不过 zod（双保险），嵌套无守卫直访链不存在——
  fallback 只给主体字段空壳值作自描述（content:'' / userStyle:'' / image:{}）。
  物料有 defineProps 默认值时，fallback 的职责从「防崩」退化为「自描述」，从简即可。
- nuiv4 判例（同样从简，机制不同结论同构）：nuiv4 包装层用 useAttrs 平铺（非 defineProps），
  渲染链路 data → attrs 直达 Nuxt UI 组件，目标库内部默认值兜底；包装层自身无模板直访——
  fallback 同样退化为自描述。注意挂载冒烟与回放剧本须**经 attrs 传值**（mount 的 attrs 选项），
  用 props 传值会静默丢失。

合并语义是浅合并 `{ ...fallback, ...transmitted }`：transmitted 的嵌套部分对象整体覆盖
fallback 对应键，不要指望深合并。

### skeletonFields：只列 zod 必填长字段

`_cx_streaming` 标记的判据是「顶层字段在 parsed data 中缺席」
（`packages/stream/src/cx-trigger-config.ts` buildPartial）。可选字段在完整帧里合法缺席，
列入会让标记终态常亮、骨架永不消失。

- 列：社媒三件 `['post']`、code-block `['code']`、message-draft `['body']`——必填且有长主体语义。
- 不列：code-diff（patch/oldCode/newCode 三键全可选）、terminal（stdout/stderr 可选）。
- comps 判例（整包不列）：9 件物料 props 全带 defineProps 默认值 = 全可选字段，
  任一列入都会终态常亮，故 skeletonFields 全缺席——「可选字段不列」判据的整包印证。

### frameStride：统一 10

首帧空壳不节流，短属性扎堆闭合合并约 0.5s 出帧，逐件体感一致；个案不佳再调，不要逐件拍脑袋取值。

## 3. wrapper 流式骨架（空壳期占位）

判路径：借槽优先（零新 DOM），无槽则自绘。

- 借槽：物料自带空态槽才可行。article 的 empty-placeholder 槽是孤例。
- 自绘：probe 实证 x-post / code-block / code-diff / message-draft 空主体时物料正文区是
  `<!---->` 注释节点，无可借占位 DOM——共享 StreamSkeleton
  （`packages/comps-vtu/src/shared/stream-skeleton.vue`，中性卡片外壳 + 行宽错落脉冲条）
  以 `v-if` 替换物料，与物料渲染互斥无闪烁。

wrapper 判据两支：

- 标记分支：`streamingFields(attrs).includes('<必填字段>')`（社媒三件 post、code-block code、
  message-draft body），`streamingFields` 在 `packages/comps-vtu/src/shared/streaming.ts`。
- 直查分支：code-diff 直查 `patch == null && oldCode == null && newCode == null`——
  superRefine 保完整帧必含其一，判据终态必假，不依赖 `_cx_streaming`。

豁免判例：terminal 不做骨架——stdout/stderr 可选无可靠标记，
「命令已出、输出待传」是自然中间态，加骨架反而闪。

整包豁免判例：comps 9 件全不做 wrapper 骨架——props 全带默认值（无可靠标记字段，
列入即终态常亮），且天然空态足够：figure 空 image 有 CxEmptyImage 占位、
文本类空壳期 displayText 兜底空格。短属性形态的收益即空壳早挂载 + 属性闭合揭示，
骨架无增量价值——「天然空态 + 无可骨架化字段」是不做骨架的合规路径。

已知机制限制：社媒骨架仅覆盖空壳期。post 顶层字段在 author.name 首个闭合帧即部分出现，
标记消失后物料直渲；text 是嵌套非必填字段，机制不支持嵌套 skeleton 判据
（加顶层 'text' 会终态常亮），中间态生长感是接受的取舍。

隐性契约：wrapper 判据依赖渲染器对 data 原样平铺、不做 schema 归一化
（已录 `.planning/codebase/CONCERNS.md`）；渲染器若引入归一化，缺席判定与直查判据同步失效。

## 4. 注册汇聚与回放按钮

- 物料包侧：`packages/comps-vtu/src/stream-triggers.ts` 汇聚全部声明导出。
  声明组织两态：vtu 每物料一件 `stream-trigger.ts` 散置物料目录（声明复杂、含 wrapper 骨架配套）；
  comps 物料包装极简（无骨架、fallback 扁平），集中单文件 `packages/comps/src/stream-triggers.ts`
  表驱动声明（key 清单 + 工厂函数 + keyOf 从物料 meta 取 key 原值，定义缺失即显式抛错）。
  物料多且声明异构时散置，少且同构时集中。nuiv4 判例：19 件 trigger 散置物料目录
  （每物料一件 stream-trigger.ts，声明含 array/region/combo 异构 section 与 emptyPassthrough
  等个案配置），包根 stream-triggers.ts 仅做桶汇聚导出 `NUXT_UI_V4_STREAM_TRIGGERS` 数组 +
  `createNuxtUiV4TriggerRegistry()` 工厂——形态归类与 arrayKey 等元信息从该数组同源推导，
  测试与页面共用，声明演进时消费方自动跟随。
- playground 侧：`playground/tests/trigger-registries.test.ts` 判定测试同步——
  注册表 `has(key)` 门控验收页卡片的回放按钮（replay-btn），断言注册清单与物料清单一致，
  「判定不适用」清单只留真有机制障碍者并写明原因。
- 回放机制：`playground/app/dev/use-card-replay.ts` 把 `{ id, key, data }`
  `JSON.stringify(pretty)` 按 6 chars / 50ms 喂 extractor——trigger 注册即回放，零额外装配。

## 5. variants 深化（验收页全视觉属性对照）

验收页每物料至少两组 variant，目标：让模板有视觉呈现的属性在组间得到对照展示。

组织（大规模时）：按目标库官方分类拆 `playground/app/dev/variants/<lib>/` 目录 +
index.ts 桶汇聚。TS 目录优先解析规则使下游 `from '~/dev/variants'` 零改动；
配组织契约测试（分类并集完整性、归属一致性、FILE_LEN ≤300 断言）。

数据纪律：

- 覆盖语义：variant.data 浅合并于 props initial 之上，undefined 键抹除 initial 对应字段。
  回放剧本必须复刻页面数据路径 `{ ...buildDefaultData(meta), ...def.data }`
  （`playground/app/dev/material-utils.ts`），否则回放与页面看到的不一致。
- 枚举与结构化值经目标库 zod 逐域核对（format kind、layout、conditionCode 这类）；
  有计数不变量的手工数据（如 unified diff 的 patch hunk 头 `@@ -a,b +c,d @@`）必须挂载实证，
  数错即渲染异常。
- 模板未渲染的 schema 属性不放 variant（无视觉差异）；判别联合的契约项
  （如 preferences-panel select item 的 selectOptions ≥5）逐项核对。

nuiv4 判例（裁决不补的三种合规终态，均须头注释 + 文档留痕）：

- 零 props 物料裁决不补：container/main/theme/form 无任何 props，footer 有五个内容槽但零 props——
  variants 只能覆盖 data，无 data 可覆盖则组间无视觉差异，走默认单 variant 兜底。
  「有槽无 props」物料的对照承诺应在拆解期以 props 清单证伪，不要到开发期才发现过度承诺。
- 浮层物料双预检：open 态组是否遮蔽验收页（modal/slideover 经 teleport 全屏遮罩，实证遮蔽）+
  closed 态组间是否有可见差异（context-menu/drawer/dropdown-menu 只渲触发区，无差异）。
  两条都不通过即整组裁决不补；popover 的 open 被 hover 模式忽略（无差异）、tooltip 的 open 态
  脱离 anchor 定位错乱（遮挡页头）、toast 为逻辑型物料（需 useToast + UToaster，无呈现载体）——
  nuiv4 Overlay 8 件逐件实证后全部裁决不补。
- array trigger 物料的主数组覆盖项 item 形态必须与其 trigger 声明的 item 形态一致，
  回放剧本才真实（页面回放与测试回放同一 replayScriptOf + buildSampleNode 数据路径）。

## 6. 测试范式

trigger 单测（`packages/comps-vtu/tests/scalar-*-triggers.test.ts`）：
收录断言（注册表 has）→ 编译 flags → 空壳帧（key 检出即出，fallback 保契约）→
属性揭示帧。中间帧断言用「逐字符喂完整文本取最后非空帧」——frameStride 窗口内帧不推进，
单字符间隔喂法拿不到中间帧；或直接喂完整 JSON 断言终态全字段。

wrapper 测试：骨架可见性（空壳期）、消失（完整帧）、中间态切换、aria-hidden 等 DOM 断言。

逐件回放链路测试（`playground/tests/vtu-variants-replay.test.ts`，variants 即剧本）：
注册门控 + 增量帧出现 + 终态收敛 + 每组挂载不抛错。终态断言按形态分支：

- scalar：全字段逐键比对（终态兜底保完整帧）。
- array：仅比对 arrayKey 字段（尾随标量按机制不进帧）。
- 空主数组：精确刻画「无增量帧、终态 null」，不放宽。
- region（nuiv4）：剧本槽完整时断言终态槽集 = 剧本槽集；缺槽剧本（手写 variants 未覆盖的物料
  走默认兜底 defs）断言终态槽集 ⊆ 声明 slots 且剧本槽不丢，不断言等于。
- combo（nuiv4）：array 字段域（主数组长度）与 region 字段域（终态 components 键集）分离断言，
  各自按自身形态语义收敛。

nuiv4 挂载冒烟与实证环境判例：

- U* 离线 stub 的作用域槽必须传对象调用：`slots.default?.()` 无参调用会使包装层编译产物
  normalizeProps(guardReactiveProps(undefined)) 产出 null，renderSlot 访问 null.key 崩溃
  （accordion/carousel/form-field/select-menu 实证）；真实 U* 渲染槽时总传 scope 对象，
  stub 应 `slots.default?.({})`。
- 数据键 ⊆ 物料声明 props 集的静态断言：页面 buildDefaultData 只做浅合并不做键校验，
  越界键会静默落进 attrs 污染 DOM，必须在测试里证伪。
- vitest it.each 标题插值用 `$label`（对象属性引用）；`%[1]s` 位置占位符非法，会原样输出。
- 回放按钮浏览器实证：DevShowcase 只对选中的物料渲染 variant 列表与回放按钮，
  逐件实证须先点侧边栏物料再查按钮，不能默认首个物料一把抓。
- Vite stale module graph：删除被引用文件后，引用方（桶文件）mtime 未变，dev server 缓存的
  转换产物仍指向已删文件，浏览器报「Failed to fetch dynamically imported module」而 curl 全链
  200——`touch` 引用方强制重解析即可修复（比重启 dev server 便宜）。

挂载冒烟的环境判例：

- code-block / code-diff 的 pierre 高亮异步填充（挂载瞬间 aria-busy=true，约 500ms 后注入），
  断言代码区前须等待。
- vue-leaflet 以 `leaflet/dist/leaflet-src.esm` 无扩展名导入，vitest node ESM 解析失败
  （页面端 vite 正常）——geo-map 挂载冒烟豁免，回放管线断言（不经 leaflet）覆盖其剧本。

dist 新鲜度：playground 测试与 dev server 消费物料包 dist，改包源码必须重建，
否则包内测试（消费 src）与 playground 测试（消费 dist）互掩，只能靠页面实证发现。

## 7. 分批提交切片（实证顺序）

垂直切片、每 commit 可独立构建测试，顺序经 29 件全量实证：

1. stream 管线修复（若有，如终态兜底）——机制级改动最先，后续切片依赖其行为
2. 长主体 scalar 声明 + trigger 单测
3. 短属性 scalar 声明 + trigger 单测（扁平 fallback 可与长主体分批，审查豁免判据更简单）
4. wrapper 骨架（StreamSkeleton + streaming.ts + 各 wrapper 改写 + DOM 测试）
5. 注册汇聚 + playground 判定测试同步
6. variants 各分类逐文件提交；目录桶与旧单文件删除同 commit（引用切换不断裂）
7. 逐件回放链路测试殿后（依赖桶路径与全部 variants）

## 8. 交付清单

- [ ] 每物料 stream-trigger.ts 三要素齐备；fallback 经模板直访链取证，判别联合按分支并集兜底
- [ ] 判定表完备性计数校验：trigger 注册数 + 不适用数 = 物料总数，逐件归属有判据
- [ ] 形态互斥归属经主载体判据裁决（scalar vs region 不可兼得，compileTrigger throw 保护）
- [ ] skeletonFields 只含 zod 必填长字段；无可骨架化字段的物料写明豁免原因
- [ ] wrapper 骨架判据两支之一成立；豁免物料（如 terminal）写明自然中间态理由
- [ ] 注册汇聚与 playground 判定测试同步，回放按钮全件可点（浏览器实证须逐件选中物料）
- [ ] 每物料 variants ≥2 组，模板有视觉呈现的属性组间对照；组织契约测试绿
- [ ] 裁决不补的物料（零 props / 浮层双预检不通过 / 逻辑型）逐件头注释留痕
- [ ] 逐件回放链路测试绿（分形态终态断言：scalar 全字段 / array 主数组 / region 槽集 / combo 分离）；
      挂载冒烟按环境判例处理异步、豁免与 stub 契约（作用域槽传对象、attrs 传值）
- [ ] dist 重建后 playground 侧测试复跑；页面实证回放时序（空壳骨架 → 属性揭示 → 完整物料）
