import { beforeEach, describe, expect, it } from 'vitest'
import { nextTick, watch } from 'vue'

import { useCxAppends } from '../src/hooks/use-cx-appends'

/**
 * useCxAppends — appends 暂存单例契约
 *
 * 多步表单(preferences-panel/question-flow 等)字段变更不直接发消息,暂存为
 * appends 条目由宿主输入区可视化;confirm 时拼接发送。增删清/deselectSignal
 * 语义钉死:append 幂等覆盖、clear/clearByWidget 按 widgetId 联动发 deselect
 * 信号(emitSignal=false 抑制回环)、clearAll 只清数据不发信号。
 */

describe('useCxAppends', () => {
  beforeEach(() => {
    const appends = useCxAppends()
    appends.clearAll()
    appends.resetDeselectSignal()
  })

  it('append 幂等覆盖同 id 条目', () => {
    const appends = useCxAppends()
    appends.append({ id: 'w1:f1', label: '通知:开', text: '通知开启', widgetId: 'w1', fieldId: 'f1' })
    appends.append({ id: 'w1:f1', label: '通知:关', text: '通知关闭', widgetId: 'w1', fieldId: 'f1' })
    expect(appends.items.value).toHaveLength(1)
    expect(appends.items.value[0]!.label).toBe('通知:关')
    expect(appends.isEmpty.value).toBe(false)
  })

  it('clear 按 id 移除并对 widgetId 发 deselect 信号(含 fieldId)', () => {
    const appends = useCxAppends()
    appends.append({ id: 'w1:f1', label: 'L', text: 'T', widgetId: 'w1', fieldId: 'f1' })
    appends.clear('w1:f1')
    expect(appends.isEmpty.value).toBe(true)
    expect(appends.deselectSignal.value).toMatchObject({ widgetId: 'w1', fieldId: 'f1' })
  })

  it('clear 无 widgetId 条目不发信号', async () => {
    const appends = useCxAppends()
    const seen: unknown[] = []
    const stop = watch(appends.deselectSignal, (v) => seen.push(v))
    appends.append({ id: 'loose', label: 'L', text: 'T' })
    appends.clear('loose')
    await nextTick()
    stop()
    expect(seen).toEqual([])
  })

  it('clear emitSignal=false 抑制信号', async () => {
    const appends = useCxAppends()
    const seen: unknown[] = []
    const stop = watch(appends.deselectSignal, (v) => seen.push(v))
    appends.append({ id: 'w1:f1', label: 'L', text: 'T', widgetId: 'w1' })
    appends.clear('w1:f1', false)
    await nextTick()
    stop()
    expect(seen).toEqual([])
  })

  it('clearByWidget 只清指定 widget 的条目并发一次信号', () => {
    const appends = useCxAppends()
    appends.append({ id: 'w1:f1', label: 'A', text: 'A', widgetId: 'w1', fieldId: 'f1' })
    appends.append({ id: 'w1:f2', label: 'B', text: 'B', widgetId: 'w1', fieldId: 'f2' })
    appends.append({ id: 'w2:f1', label: 'C', text: 'C', widgetId: 'w2', fieldId: 'f1' })
    appends.clearByWidget('w1')
    expect(appends.items.value.map((i) => i.id)).toEqual(['w2:f1'])
    expect(appends.deselectSignal.value).toMatchObject({ widgetId: 'w1', fieldId: undefined })
  })

  it('clearAll 清空全部且不发 deselect 信号(信号经 cx 事件通道分发,此侧只清数据)', async () => {
    const appends = useCxAppends()
    const seen: unknown[] = []
    const stop = watch(appends.deselectSignal, (v) => seen.push(v))
    appends.append({ id: 'w1:f1', label: 'A', text: 'A', widgetId: 'w1' })
    appends.append({ id: 'w2:f1', label: 'B', text: 'B', widgetId: 'w2' })
    appends.clearAll()
    await nextTick()
    stop()
    expect(appends.isEmpty.value).toBe(true)
    expect(seen).toEqual([])
  })

  it('deselectSignal timestamp 递增(同 widget 连发两次信号不丢)', async () => {
    const appends = useCxAppends()
    appends.append({ id: 'w1:f1', label: 'A', text: 'A', widgetId: 'w1' })
    appends.clear('w1:f1')
    const first = appends.deselectSignal.value?.timestamp
    await new Promise((r) => setTimeout(r, 2))
    appends.append({ id: 'w1:f1', label: 'A', text: 'A', widgetId: 'w1' })
    appends.clear('w1:f1')
    const second = appends.deselectSignal.value?.timestamp
    expect(second).toBeGreaterThanOrEqual(first ?? 0)
  })
})
