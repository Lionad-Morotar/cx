# @lionad/cx-stream

流式结构化渲染管线：从 LLM 流式输出的**不完整 JSON** 中增量提取可渲染的组件树，让大数组（表格行、图表数据）在传输过程中就渐进渲染，而不是等整个 JSON 闭合后才出现。

源自线上 AI 聊天场景的生产渲染管线，重写为三方库无关的通用包。

## 两条解耦轴

- **不绑定 LLM Provider**：包只消费「一根不断生长的字符串」（`Ref<string>`）。Coze / OpenAI / 任意 SSE 协议的解析留在消费端
- **不绑定组件库**：包体零组件 key 字面量。组件知识（扫描路径 + 部分树构造）经 trigger registry 由消费端注册注入

渲染协议默认对接 cx（`@lionad/cx-definition` 的组件树），但 core 层对树形状无感知，预设可替换。

## 结构

```
core/    纯 TS，零 vue 依赖
  bracket-scanner.ts   字符级括号平衡扫描（对象根 / 顶层数组根）
  parse.ts             safeJsonParse（jsonrepair 回退 + 100KB 内存保护）
  fence.ts             围栏代码块正则工具
  spec-detector.ts     三态漏斗：text / widget（闭合）/ pending（未闭合）
  incremental.ts       增量管线 + trigger registry 工厂
  human-text.ts        部分 JSON 人类可读文本提取 + 打字机素材
vue/     composables 绑定层（peer: vue ^3）
  useStreamChunks.ts       多策略 marker 流式切分
  useIncrementalTree.ts    增量提取器的响应式包装
  usePendingTypewriter.ts  打字机动画（跨实例状态共享 + 驱动权移交）
cx.ts    cx 预设：CxStreamNode 类型 / 检测配置 / 文本提取配置 / 协议匹配器
```

## 快速上手

### 1. 检测流式文本中的 Spec（三态漏斗）

```ts
import { createSpecDetector, cxSpecDetectorConfig } from '@lionad/cx-stream'

const detector = createSpecDetector(cxSpecDetectorConfig)
const result = detector.extractSpecs(streamingText)
// result.status: 'none' | 'pending' | 'success'
// result.content: 代码块替换为 <widget-slot>/<pending-slot> 占位符的文本
// result.pendingSources: 未闭合代码块的原始 JSON（隔离,防泄漏到 markdown 渲染层）
```

占位符协议：`<widget-slot data-spec-index="INDEX_PLACEHOLDER" data-spec-key="..." data-spec-array-index="n">`。
`INDEX_PLACEHOLDER` 由 host 在汇总多 chunk 后替换为全局 spec 索引；
host 的 markdown 流渲染器按标签名把占位符映射为组件（如 markstream 的 customHtmlTags）。
标签名经 detector 配置可换。

### 2. pending 阶段增量渲染

```ts
import {
  createTriggerRegistry, createIncrementalExtractor, matchCxTrigger,
} from '@lionad/cx-stream'

const registry = createTriggerRegistry<CxSpec>()
registry.register('cx-demo-table', {
  scanPaths: [['data', 'columns', '*'], ['data', 'rows', '*']],
  buildPartial(spec) {
    // 从已解析的完整前缀构造可渲染的部分树（new 数组引用,供渲染端检测变化）
    ...
  },
})

const extractor = createIncrementalExtractor<CxSpec>({ registry, matchTrigger: matchCxTrigger })
const partial = extractor.next(pendingSourceText)  // 每个 SSE delta 喂一次全量文本
```

Vue 侧用 `useIncrementalTree(computed(() => sourceText), config)` 获得响应式 `partialSpec`。
解析失败的 delta 自动保持上次有效结果（lastValid），渲染组件不会闪没。

### 3. 打字机预览

```ts
import { usePendingTypewriter, cxHumanTextConfig } from '@lionad/cx-stream'

const { displayText, exit } = usePendingTypewriter(
  computed(() => pendingSource),
  { stateKey: `${messageId}:${specIndex}`, humanText: cxHumanTextConfig },
)
// widget 接管渲染前调 exit(onDone) 展示逐字删除过渡
```

`stateKey` 相同的实例共享动画状态（抵抗宿主渲染器重建）；
双实例并存时驱动权自动移交，卸载其一不影响存活实例。

## 编写 trigger

trigger 是「组件 key → 增量规则」的纯数据：

- `scanPaths`：bracket-scanner 路径。对象根从属性 key 起（`['data', 'rows', '*']`）；
  顶层数组根以元素索引为首段（`['*', 'data', 'rows', '*']`）；`'*'` 通配
- `buildPartial(spec, matchesPerPath)`：从解析结果构造部分树；数据不足返回 null

新组件接入只需 `registry.register(key, trigger)`，管线零修改。

## LLM 输出约定（cx 预设）

- Spec 置于 ```json 代码块内（也支持裸 JSON 兜底）
- 标准 JSON（双引号）；对象以 `"id"` 或 `"key"` 字段开头
- 单根对象；多 widget 用布局容器的 `components` 子树承载
- 最小节点契约 `{ id?, key, data?, components? }`，其余字段由 cx-render 从组件 meta 补全

## 开发

```bash
# 测试（monorepo 根，Vite+ 工具链）
pnpm vp test packages/stream

# 类型检查 / 构建
pnpm -C packages/stream typecheck
pnpm -C packages/stream build
```
