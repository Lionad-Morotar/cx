# 测试模式

**分析日期：** 2026-07-20

## 测试框架

**Runner：**

- Vitest 4.1.10（pnpm overrides 锁定，`pnpm-workspace.yaml:7`）
- 配置：根 `vite.config.ts:28-37` 的 `test` 字段（Vite+ 统一出口）
- 全局 setup：`playground/tests/setup.ts`
- 环境：`happy-dom`（devDependencies 锁 `^20.11.0`）

**Assertion Library：**

- Vitest 内置 `expect`，搭配 `@vue/test-utils` 的 `wrapper.text()` / `wrapper.find()` / `wrapper.classes()` 做组件断言
- jest-dom 风格 matcher 未安装；DOM 断言用原生方法：`wrapper.element.tagName.toLowerCase() === 'p'`、`wrapper.find('.cls').exists()`

**组件挂载：**

- `@vue/test-utils` `^2.4.11`（根 `package.json:14`）
- `mount(component, { props, slots, global: { directives, provide } })`

**TypeScript：** Vitest 直接读根 `tsconfig.base.json`，无需单独配置。

**Run Commands：**

```bash
pnpm test              # 根目录跑全部测试（= vp test）
pnpm test -- <path>    # 针对单文件：pnpm test playground/tests/utils-date.test.ts
pnpm test -- --watch   # watch 模式（开发期）
pnpm typecheck         # 全仓类型检查（= pnpm -r run typecheck）
pnpm check             # fmt + lint + 类型检查（= vp check）
```

**项目偏好：** 开发期针对性跑「单文件 + tsc --noEmit」更快；周期性跑 `vp test` 全量收尾。`pnpm test` 全量任务请加超时时间。

## 测试文件组织

**位置：** 三种允许的路径（`vite.config.ts:29-33`）：

1. `packages/*/src/**/*.test.ts` — 与源码同目录（尚未广泛使用）
2. `packages/*/tests/**/*.test.ts` — 子包专属测试目录（子包内聚测试）
3. `playground/tests/**/*.test.ts` — 域级集成 / 契约 / smoke 测试

**排除：**

- `playground/tests/setup.ts`（被 setupFiles 引用，本身不是测试）
- `dist/**`、`packages/components-nuxt-ui-v4/vendor/**`、`playground/.output/**`、`playground/.nuxt/**`（lint/fmt/test 共同忽略）

**命名：**

- 与被测对象同名 + `.test.ts`：`utils/date.ts` ↔ `utils-date.test.ts`、`hooks/use-request/index.ts` ↔ `use-request.test.ts`、`utils/cyber.ts` ↔ `cyber-envelope.test.ts`
- 测试主题作为后缀：`materials-smoke.test.ts`、`mock-contract.test.ts`、`server-write-routes.test.ts`

**当前测试清单（12 个测试文件）：**

| 文件                                                     | 类型             | 被测对象                                       |
| -------------------------------------------------------- | ---------------- | ---------------------------------------------- |
| `packages/definition/tests/normalize.test.ts`            | 单元             | `normalize` / `toJSON` schema 装配             |
| `packages/definition/tests/runtime-algorithms.test.ts`   | 单元（算法表征） | `cloneComponent` / `makeTree`                  |
| `packages/vue/tests/use-request.test.ts`                 | 单元（行为）     | `useRequest` 注入栈 + 数据合并                 |
| `packages/components/tests/materials.test.ts`            | smoke            | `CxBasics` 物料挂载与 normalize                |
| `packages/components-nuxt-ui-v4/tests/materials.test.ts` | smoke            | `CxNuxtUI` vendored 物料挂载                   |
| `playground/tests/cyber-envelope.test.ts`                | 契约             | `request` 包络处理（ofetch/ElMessage mock）    |
| `playground/tests/mock-contract.test.ts`                 | 契约             | `mocks/data/*.json` 数据层契约                 |
| `playground/tests/server-write-routes.test.ts`           | 集成             | server 写路由全链路（mock-event + mock-store） |
| `playground/tests/materials-smoke.test.ts`               | smoke            | 站会 25 个 normalize 物料                      |
| `playground/tests/utils-date.test.ts`                    | 单元             | `generateDay` / `getDayRange` / dayjs 配置     |
| `playground/tests/utils-formatter.test.ts`               | 单元             | `isEmpty` / `fallback` / `toCNNumber`          |
| `playground/tests/utils-label.test.ts`                   | 单元             | `StageLabels` / `getTaskStepsSpendSeconds`     |

**目录结构：**

```
cx/
├── packages/
│   ├── definition/tests/         # schema 装配 + 核心算法
│   ├── vue/tests/                # composable 行为
│   ├── components/tests/         # 基础物料 smoke
│   └── components-nuxt-ui-v4/tests/  # vendored 物料 smoke
└── playground/
    └── tests/
        ├── setup.ts              # 全局 setup（h3 自动导入挂载 + fetch 桩）
        ├── cyber-envelope.test.ts
        ├── mock-contract.test.ts
        ├── server-write-routes.test.ts
        ├── materials-smoke.test.ts
        └── utils-*.test.ts
```

## 测试结构

**Suite 组织：** 每个文件多个 `describe`，按被测公共面分组；每个 `it` 描述一条行为，**用中文**写。

```typescript
// 来自 packages/definition/tests/normalize.test.ts:10-22
describe('normalize', () => {
  it('key 转 PascalCase 作为组件 name', () => {
    const cmpt = normalize({
      name: '文本',
      icon: 'i-tabler-edit',
      description: '文本组件',
      key: 'cx-text',
      component: stubCmpt,
    }) as any

    expect(cmpt.name).toBe('CxText')
    expect(cmpt.key).toBe('cx-text')
  })
})
```

**Patterns：**

- **Setup：** 用 `beforeEach` 重置状态，避免用例间泄漏（`playground/tests/server-write-routes.test.ts:36-40` 重置 mock collection）
- **Teardown：** 资源型测试用 `try { ... } finally { cleanup() }` 保证清理（`packages/vue/tests/use-request.test.ts:20-28` 在每个 `it` 内 `provideInstance` + `finally removeInstance`）
- **隔离：** 单文件 `beforeEach` 用 `vi.clearAllMocks()` 清 mock 调用计数（`playground/tests/cyber-envelope.test.ts:19-21`）

**`it` 命名建议：**

- 行为描述用动宾结构：`'apiNormal 调用最近注入的 request 实例'`、`'data 深拷贝：改克隆体不影响源'`
- 边界条件加前缀：`'空列表短路'`、`'非法区间直接抛错'`、`'无 to 时为无限生成器，调用方自行截断'`
- 契约用「契约」结尾：`'participants 是 JSON 字符串且 parse 后为数组（元素为参会用户 id）'`

## Mock（模拟）

**Framework：** Vitest 内置 `vi`

**核心 API：**

- `vi.fn(impl?)` — 创建可观测桩函数
- `vi.mock(module, factory)` — 模块级 mock，**hoisted 到文件顶部**
- `vi.mocked($fetch)` — 取得 mock 后的引用并恢复类型
- `vi.stubGlobal(key, value)` — 全局对象桩（`fetch` 等）
- `vi.clearAllMocks()` — 清调用计数（保留实现）
- `mockResolvedValue(...)` / `mockRejectedValue(...)` — 异步桩返回值

**模块 mock 模式：**

```typescript
// 来自 playground/tests/cyber-envelope.test.ts:1-15
import { beforeEach, describe, expect, it, vi } from 'vitest'

// mock ofetch 与 ElMessage，隔离网络与 UI 层
vi.mock('ofetch', () => ({
  $fetch: vi.fn(),
}))
vi.mock('element-plus', () => ({
  ElMessage: { error: vi.fn() },
}))

import { $fetch } from 'ofetch'
import { ElMessage } from 'element-plus'
import { request } from '../app/standup/utils/cyber'

const mockedFetch = vi.mocked($fetch)
```

**关键约定：**

- `vi.mock` 必须在文件顶部、`import` 被测模块**之前**（Vitest 自动 hoist）
- mock 工厂返回的对象**必须**覆盖被测代码用到的所有命名导出
- mock 后立刻 `import` 真实模块（如上方 `import { $fetch } from 'ofetch'`）以取得 mock 引用

**全局 fetch 桩（setup.ts）：**

```typescript
// 来自 playground/tests/setup.ts:14-25
const envelope = { code: '0', message: 'ok', success: true, data: [] }

vi.stubGlobal(
  'fetch',
  vi.fn(
    async () =>
      new Response(JSON.stringify(envelope), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
  ),
)
```

**setup.ts 同时挂载 nitro 自动导入的 h3 工具：**

```typescript
// 来自 playground/tests/setup.ts:1-10
import { defineEventHandler, readBody, getRouterParam, setResponseHeader } from 'h3'

// nitro 自动导入的 h3 工具在 vitest 环境手动挂载（server routes 测试需要）
Object.assign(globalThis, {
  defineEventHandler,
  readBody,
  getRouterParam,
  setResponseHeader,
})
```

**什么要 Mock：**

- 网络层：`ofetch` / `fetch`（避免触网，单测可重复）
- UI 反馈层：`element-plus` 的 `ElMessage`（避免挂载 DOM 弹窗）
- 宿主注入：`CxRequestFn` 经 `useRequest.provideInstance(req)` 注入桩函数（`packages/vue/tests/use-request.test.ts:9-14`）
- 全局单例：`globalThis.fetch` 经 `vi.stubGlobal`

**什么不要 Mock：**

- 被测模块自身（`request`、`useRequest`、`normalize` 等）
- `mocks/data/*.json` 真实文件（契约测试直接读文件，不通过 server，见 `playground/tests/mock-contract.test.ts:13-22`）
- Vue 渲染层（用 `@vue/test-utils` 的真实 `mount`，不 mock Vue 内部）

## Fixtures 与工厂

**测试数据：** 不使用外部 fixture 文件，**就地构造**或**读真实 mock JSON**。

**就地构造模式：**

```typescript
// 来自 packages/definition/tests/runtime-algorithms.test.ts:38-45
const source = () => {
  const utils = makeRuntimeUtils()
  const child = utils.createComponent({ key: 'cx-text' }, { content: '子' })
  const root = utils.createComponent({ key: 'cx-block' }, { theme: 'dark' })
  root.components = { default: [child] }
  child.parents = [root.id]
  return { utils, root, child }
}
```

**读 JSON 模式：**

```typescript
// 来自 playground/tests/mock-contract.test.ts:7-22
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const DATA_DIR = join(__dirname, '..', 'mocks', 'data')
const read = (name: string) => JSON.parse(readFileSync(join(DATA_DIR, `${name}.json`), 'utf-8'))

const users = read('users') as any[]
const standups = read('standups') as any[]
```

**Seed + structuredClone 模式（写操作测试）：**

```typescript
// 来自 playground/tests/server-write-routes.test.ts:23-40
const seedStandups = [
  {
    id: '9001',
    type: 'day',
    name: '2026-07-18',
    meetingDate: '2026-07-18',
    state: 'ENDED',
    participants: '["1001"]',
  },
]
const seedMemos: unknown[] = []
const seedIssues = [{ id: 'i1', name: '旧标题', title: '旧标题' }]

beforeEach(() => {
  setCollection('standups', structuredClone(seedStandups))
  setCollection('memos', structuredClone(seedMemos))
  setCollection('issues', structuredClone(seedIssues))
})
```

**Vue 组件桩（stubCmpt）：**

```typescript
// 来自 packages/definition/tests/normalize.test.ts:7-8
/** 最小 Vue 组件桩：normalize 只读写属性，不要求真实渲染 */
const stubCmpt = { render: () => null } as unknown as Component
```

**复杂挂载桩：**

```typescript
// 来自 packages/components-nuxt-ui-v4/tests/materials.test.ts:11-30
const fakeCmpt = (key: string) => ({ id: `test-${key}`, key, data: {}, components: {} })

const mountMaterial = (cmpt, props = {}, opts = {}) =>
  mount(cmpt, {
    props: { cmpt: fakeCmpt(cmpt._cx_meta?.key || 'x'), ...props },
    global: {
      directives: { cx: { mounted() {} } }, // 编辑器指令 no-op
      provide: {
        cx: undefined,
        'is-cx-edit': false,
        'is-cx-debug': false,
      },
      ...opts,
    },
  })
```

**位置：**

- 单文件用例内的 fixture 就近定义（同一文件顶部）
- 跨文件复用的 mock 数据存 `playground/mocks/data/*.json`（生成产物，入库）
- 复用工厂函数定义在测试文件内（无 `__fixtures__/` 目录）

## 覆盖率

**要求：** 未强制覆盖率阈值

**查看覆盖率：**

```bash
pnpm test -- --coverage
```

当前未启用持续追踪。新增代码要求**有对应测试**（项目级偏好「垂直切片 TDD」，根 `CLAUDE.md`），但不强制百分比。

## 测试类型

**单元测试：**

- 纯函数 / composable / 类型的行为测试
- 依赖全 mock，断言聚焦单一公共面
- 例：`packages/definition/tests/normalize.test.ts`、`packages/vue/tests/use-request.test.ts`、`playground/tests/utils-*.test.ts`

**算法表征测试（Characterization）：**

- 针对核心算法（`cloneComponent`、`makeTree`）的语义稳定性测试
- 桩隔离 id 生成等副作用，断言聚焦装配/排序语义
- 例：`packages/definition/tests/runtime-algorithms.test.ts:7-11`

**契约测试（Contract）：**

- 跨层数据形态契约：mock JSON ↔ 前端类型 ↔ server 包络
- 直接读文件不走 server，脱离 nitro 环境独立可验
- 例：`playground/tests/mock-contract.test.ts`、`playground/tests/cyber-envelope.test.ts`

**Smoke 测试：**

- 物料组件可挂载、props 归一化不炸、`_cx_meta` 装配完整
- 不深入断言渲染细节，只验证「**不爆** + **关键文本出现**」
- 例：`packages/components/tests/materials.test.ts`、`packages/components-nuxt-ui-v4/tests/materials.test.ts`、`playground/tests/materials-smoke.test.ts`

**集成测试：**

- server 路由全链路：handler → mock-store → 包络
- 用 `mockEvent` 构造 h3 event 桩，绕过 nitro runtime
- 例：`playground/tests/server-write-routes.test.ts`

**E2E 测试：** 未使用（当前不依赖 Playwright / Cypress）。**禁止：e2e 测试时调 api 绕过测试**（根 `CLAUDE.md`）。

## 常见模式

**异步测试：**

```typescript
// 来自 packages/vue/tests/use-request.test.ts:17-28
it('apiNormal 调用最近注入的 request 实例', async () => {
  const req = makeRequest()
  useRequest.provideInstance(req)
  try {
    const [apiNormal] = useRequest({ url: '/api/test' })
    const res = await apiNormal()
    expect(req).toHaveBeenCalledOnce()
    expect(res.data.echo.url).toBe('/api/test')
  } finally {
    useRequest.removeInstance(req)
  }
})
```

- 异步用 `async/await`，不用 `.then()` 链
- `expect(async fn).rejects.toThrow(msg)` 验证 reject
- `expect(vi.fn).toHaveBeenCalledOnce()` 精确次数断言

**错误测试：**

```typescript
// 同步抛错
expect(() => [...generateDay('2026-07-04', 'next', '2026-07-01')]).toThrow(/illegal range/)

// 异步 reject
await expect(request({ url: '/x', method: 'POST' })).rejects.toThrow('500 boom')
expect(ElMessage.error).toHaveBeenCalledWith('网络请求异常')
```

**生成器测试：**

```typescript
// 来自 playground/tests/utils-date.test.ts:20-24
it('无 to 时为无限生成器，调用方自行截断', () => {
  const gen = generateDay('2026-07-01', 'next')
  const first = gen.next().value
  expect(dayStr(first)).toBe('2026-07-01')
})
```

**Vue 组件挂载 + 指令桩：**

```typescript
// 来自 packages/components/tests/materials.test.ts:11-22
const mountWithCx = (component, props = {}, opts = {}) =>
  mount(component, {
    props,
    slots: opts.slots,
    global: {
      // v-cx 指令由宿主编辑器安装，测试中注册 no-op 版避免警告
      directives: { cx: { mounted() {} } },
    },
  })
```

**批量断言（for...of 而非 forEach）：**

```typescript
// 来自 playground/tests/mock-contract.test.ts:44-61
for (const u of users) {
  expect(u).toMatchObject({
    id: expect.any(String),
    name: expect.any(String),
    username: expect.any(String),
    avatarUrl: expect.any(String),
    // ...
  })
  expect(u.avatarUrl).toBe(`/api/avatar/${u.username}`)
}
```

**H3 event 桩（server 路由测试）：**

```typescript
// 来自 playground/tests/server-write-routes.test.ts:11-21
function mockEvent(body: unknown) {
  return {
    method: 'POST',
    _requestBody: Buffer.from(JSON.stringify(body ?? {})),
    node: {
      req: { headers: { 'content-type': 'application/json' } },
    },
    context: {},
  } as never
}

const result = (await standupStart(mockEvent({ type: 'day' }))) as { data: { id: string } }
```

## 测试反模式（禁止）

- **`it.skip` / `describe.skip` / `it.todo`**：当前仓库零容忍，见测试清单全绿
- **`test.only`**：禁止提交带 only 的测试
- **e2e 调 api 绕过**：根 `CLAUDE.md` 明文禁止
- **mock 真实业务模块**：只 mock 外部依赖（ofetch、element-plus、fetch 全局）
- **共享可变 fixture**：用 `structuredClone(seed)` 或 `beforeEach` 重置

## CI 集成

**当前状态：** 仓库未配置 CI pipeline，本地 `pnpm check && pnpm test` 即质量门。

**本地质量门流程（推荐顺序）：**

```bash
# 1. 针对性单文件验证（最快）
pnpm test -- <changed.test.ts>
pnpm -F @lionad/cx-vue run typecheck    # 受影响子包类型检查

# 2. 周期性全量收尾
pnpm test                  # 全部 vitest
pnpm -r run typecheck      # 全仓 tsgo
pnpm check                 # fmt + lint + 类型检查（vp check）
```

---

_测试分析：2026-07-20_
