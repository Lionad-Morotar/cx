import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createComponentsTriggerRegistry } from '@lionad/cx-comps'
import { createVtuTriggerRegistry, mainArrayOf } from '@lionad/cx-comps-vtu'
import {
  REPLAY_CHARS_PER_SEC,
  replayScriptOf,
  useCardReplay,
  type ReplaySourceNode,
} from '../app/dev/use-card-replay'

// /dev/components* 验收页卡片回放按钮的无头契约：
// 定时器以 vi.useFakeTimers 驱动（50ms 一拍），断言基于管线语义输出
// （phase / partial 项数 / sawPartial 标记），不锚定字符偏移与时间常量本身。

const TICK_MS = 50

/** 卡片上的运行时节点（含 CxRender 消费所需的冗余运行时字段，同 toItem 产物） */
const tableNode = {
  id: 'dev-cx-vtu-data-table',
  key: 'cx-vtu-data-table',
  name: '数据表格',
  aliasKeys: [],
  data: {
    columns: [
      { key: 'name', label: '名称' },
      { key: 'role', label: '角色' },
    ],
    data: [
      { name: 'Alice', role: '管理员' },
      { name: 'Bob', role: '成员' },
      { name: 'Carol', role: '成员' },
      { name: 'Dave', role: '访客' },
    ],
  },
  props: {},
  emits: {},
  exposes: {},
  parents: [],
  components: {},
}

const textNode = {
  id: 'dev-cx-text',
  key: 'cx-text',
  name: '文本',
  aliasKeys: [],
  data: { content: '流式回放示例文本' },
  props: {},
  emits: {},
  exposes: {},
  parents: [],
  components: {},
}

// 无 trigger 场景专用节点：cx-text 注册标量主体形态 trigger 后，
// 以判定维持不适用的 cx-block（容器槽，增长在 components 树而非 data）顶替
const blockNode = {
  id: 'dev-cx-block',
  key: 'cx-block',
  name: '块',
  aliasKeys: [],
  data: {},
  props: {},
  emits: {},
  exposes: {},
  parents: [],
  components: {},
}

/** 播到流结束所需的拍数（+2 裕量覆盖末拍取整） */
const ticksToEnd = (node: ReplaySourceNode) =>
  Math.ceil(replayScriptOf(node).length / (REPLAY_CHARS_PER_SEC * (TICK_MS / 1000))) + 2

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

describe('卡片回放 · 剧本装配', () => {
  it('replayScriptOf 剥除运行时冗余字段，只保留最小契约', () => {
    const script = JSON.parse(replayScriptOf(tableNode))
    expect(script).toEqual({ id: tableNode.id, key: tableNode.key, data: tableNode.data })
    for (const runtimeKey of ['aliasKeys', 'props', 'emits', 'exposes', 'parents', 'name']) {
      expect(runtimeKey in script, `${runtimeKey} 不应进剧本`).toBe(false)
    }
  })

  it('非空 components 子树保留，空对象剥除', () => {
    const withChildren = { ...textNode, components: { default: [{ key: 'cx-text' }] } }
    const empty = JSON.parse(replayScriptOf(textNode))
    const full = JSON.parse(replayScriptOf(withChildren))
    expect('components' in empty).toBe(false)
    expect(full.components.default).toHaveLength(1)
  })
})

describe('卡片回放 · 有 trigger 组件的增量收敛', () => {
  it('有 trigger 组件 hasTrigger 为 true，供页面门控回放按钮', () => {
    const replay = useCardReplay(tableNode, { registry: createVtuTriggerRegistry() })
    expect(replay.hasTrigger).toBe(true)
  })

  it('播放期间增量帧出现、项数单调递增、终拍落终态', () => {
    const replay = useCardReplay(tableNode, {
      registry: createVtuTriggerRegistry(),
      countOf: (node) => mainArrayOf(node)?.length ?? null,
    })
    expect(replay.phase.value).toBe('idle')
    replay.play()
    expect(replay.phase.value).toBe('playing')

    const counts: number[] = []
    for (let i = 0; i < ticksToEnd(tableNode); i++) {
      vi.advanceTimersByTime(TICK_MS)
      if (replay.partial.value) counts.push(mainArrayOf(replay.partial.value)!.length)
    }

    expect(replay.phase.value).toBe('done')
    expect(replay.sawPartial.value).toBe(true)
    expect(counts.length).toBeGreaterThan(1)
    expect(counts[0]).toBeLessThan(4)
    expect(counts.at(-1)).toBe(4)
    for (let i = 1; i < counts.length; i++) {
      expect(counts[i]).toBeGreaterThanOrEqual(counts[i - 1]!)
    }
  })

  it('播放中 toggle 复位回 idle 且增量状态清零', () => {
    const replay = useCardReplay(tableNode, { registry: createVtuTriggerRegistry() })
    replay.play()
    vi.advanceTimersByTime(TICK_MS * 20)
    replay.toggle()
    expect(replay.phase.value).toBe('idle')
    expect(replay.partial.value).toBeNull()
    // 复位后定时器已停：继续走时不应再产生增量帧
    vi.advanceTimersByTime(TICK_MS * 20)
    expect(replay.phase.value).toBe('idle')
  })
})

describe('卡片回放 · 无 trigger 组件的一次性渲染', () => {
  it('无 trigger 组件 hasTrigger 为 false，供页面隐藏回放按钮', () => {
    const replay = useCardReplay(blockNode, { registry: createComponentsTriggerRegistry() })
    expect(replay.hasTrigger).toBe(false)
  })

  it('全程无增量帧，播完落终态且 sawPartial 留痕为 false', () => {
    const replay = useCardReplay(blockNode, { registry: createComponentsTriggerRegistry() })
    replay.play()
    for (let i = 0; i < ticksToEnd(blockNode); i++) {
      vi.advanceTimersByTime(TICK_MS)
      expect(replay.partial.value).toBeNull()
    }
    expect(replay.phase.value).toBe('done')
    expect(replay.sawPartial.value).toBe(false)
  })

  it('doneNote：仅播完且全程无增量帧时出现（卡片 footer 说明文案）', () => {
    const replay = useCardReplay(blockNode, { registry: createComponentsTriggerRegistry() })
    expect(replay.doneNote.value).toBeNull()
    replay.play()
    for (let i = 0; i < ticksToEnd(blockNode); i++) vi.advanceTimersByTime(TICK_MS)
    expect(replay.phase.value).toBe('done')
    expect(replay.doneNote.value).toBeTruthy()
    // 重播后说明随增量状态清零
    replay.toggle()
    expect(replay.doneNote.value).toBeNull()
  })

  it('有 trigger 组件播完后 doneNote 保持为 null（正常增量渲染，无需说明）', () => {
    const replay = useCardReplay(tableNode, { registry: createVtuTriggerRegistry() })
    replay.play()
    for (let i = 0; i < ticksToEnd(tableNode); i++) vi.advanceTimersByTime(TICK_MS)
    expect(replay.phase.value).toBe('done')
    expect(replay.doneNote.value).toBeNull()
  })

  it('终态下 toggle 重播：播完再次落终态', () => {
    const replay = useCardReplay(blockNode, { registry: createComponentsTriggerRegistry() })
    replay.play()
    for (let i = 0; i < ticksToEnd(blockNode); i++) vi.advanceTimersByTime(TICK_MS)
    expect(replay.phase.value).toBe('done')
    replay.toggle()
    expect(replay.phase.value).toBe('playing')
    expect(replay.partial.value).toBeNull()
    for (let i = 0; i < ticksToEnd(blockNode); i++) vi.advanceTimersByTime(TICK_MS)
    expect(replay.phase.value).toBe('done')
  })
})
