import { describe, expect, it } from 'vitest'

import { CxVtu } from '../src/index'
import {
  classifyCxEvent,
  cxAppendText,
  cxConfirmText,
  cxDirectText,
  cxEventToAppend,
  cxSelectionToText,
  DEFAULT_CX_EVENT_DISPOSITIONS,
  defineCxEventSemantics,
} from '../src/event-semantics/index'

/**
 * event-semantics — 物料×事件二维分流与回写文本构造(SDK 默认语义)
 *
 * 数据驱动默认表(DEFAULT_CX_EVENT_DISPOSITIONS)必须与本包物料 meta emits
 * 对齐:表内物料即本包交互物料,表内事件键 ⊆ 该物料 emits 声明——
 * 同仓测试钉死,物料新增事件或改键时此处红,防语义表与物料漂移。
 * 文案即 SDK 默认,宿主零定制可得可用回写;定制走 defineCxEventSemantics。
 */

const INTERACTIVE_KEYS = [
  'cx-vtu-option-list',
  'cx-vtu-approval-card',
  'cx-vtu-data-table',
  'cx-vtu-item-carousel',
  'cx-vtu-message-draft',
  'cx-vtu-question-flow',
  'cx-vtu-preferences-panel',
  'cx-vtu-parameter-slider',
]

const byKey = (key: string) => CxVtu.find((x: any) => x._cx_meta.key === key)!

describe('默认表与物料 meta emits 防漂移', () => {
  it('默认表覆盖的物料恰为 8 件交互物料', () => {
    expect(Object.keys(DEFAULT_CX_EVENT_DISPOSITIONS).sort()).toEqual([...INTERACTIVE_KEYS].sort())
  })

  it.each(INTERACTIVE_KEYS)('%s: 表内事件键 ⊆ meta emits 键集', (key) => {
    const emitsKeys = Object.keys((byKey(key) as any)._cx_meta.emits ?? {})
    for (const event of Object.keys(DEFAULT_CX_EVENT_DISPOSITIONS[key]!)) {
      expect(emitsKeys).toContain(event)
    }
  })
})

describe('classifyCxEvent 四态分流', () => {
  it.each([
    ['cx-vtu-option-list', 'action', 'direct'],
    ['cx-vtu-option-list', 'change', 'direct'],
    ['cx-vtu-option-list', 'update:modelValue', 'ignore'],
    ['cx-vtu-approval-card', 'confirm', 'confirm'],
    ['cx-vtu-approval-card', 'cancel', 'ignore'],
    ['cx-vtu-data-table', 'link-click', 'direct'],
    ['cx-vtu-item-carousel', 'item-click', 'direct'],
    ['cx-vtu-item-carousel', 'item-action', 'direct'],
    ['cx-vtu-message-draft', 'send', 'direct'],
    ['cx-vtu-message-draft', 'undo', 'append'],
    ['cx-vtu-message-draft', 'cancel', 'ignore'],
    ['cx-vtu-question-flow', 'select', 'append'],
    ['cx-vtu-question-flow', 'step-change', 'append'],
    ['cx-vtu-question-flow', 'complete', 'confirm'],
    ['cx-vtu-question-flow', 'back', 'ignore'],
    ['cx-vtu-preferences-panel', 'change', 'append'],
    ['cx-vtu-preferences-panel', 'action', 'confirm'],
    ['cx-vtu-parameter-slider', 'change', 'append'],
    ['cx-vtu-parameter-slider', 'action', 'confirm'],
  ] as const)('%s × %s → %s', (key, event, kind) => {
    expect(classifyCxEvent(key, event)).toEqual({ kind })
  })

  it('未知物料与未登记事件一律 ignore(零副作用兜底)', () => {
    expect(classifyCxEvent('cx-vtu-article', 'whatever')).toEqual({ kind: 'ignore' })
    expect(classifyCxEvent('cx-vtu-option-list', 'unregistered')).toEqual({ kind: 'ignore' })
  })
})

describe('cxDirectText 直发回写文本', () => {
  it('option-list: action 取 args[1](当前选择值),change 退化 args[0]', () => {
    expect(cxDirectText('cx-vtu-option-list', 'action', ['ok', ['a', 'b']])).toBe('a, b')
    expect(cxDirectText('cx-vtu-option-list', 'change', [['x']])).toBe('x')
  })

  it('data-table: 行级文本(行号 1 起 + 行内容摘要)', () => {
    const text = cxDirectText('cx-vtu-data-table', 'link-click', [
      { rowIndex: 1, text: '查看', row: ['李四', '设计'], column: { title: '详情' } },
    ])
    expect(text).toBe('点了表格第2行的「查看」(行内容:李四 / 设计)')
  })

  it('data-table: 无行内容省略括号;无 text 退化列名;无行号退化「一行」', () => {
    expect(
      cxDirectText('cx-vtu-data-table', 'link-click', [
        { rowIndex: 0, text: '查看', row: [], column: { title: '详情' } },
      ])
    ).toBe('点了表格第1行的「查看」')
    expect(
      cxDirectText('cx-vtu-data-table', 'link-click', [
        { rowIndex: -1, row: ['a'], column: { label: '详情列' } },
      ])
    ).toBe('点了表格一行的「详情列」(行内容:a)')
  })

  it('item-carousel: item-action 与 item-click', () => {
    expect(cxDirectText('cx-vtu-item-carousel', 'item-action', ['it-1', 'buy'])).toBe(
      '条目 it-1 执行 buy'
    )
    expect(cxDirectText('cx-vtu-item-carousel', 'item-click', ['it-2'])).toBe('查看条目 it-2')
  })

  it('message-draft: send 固定「发送草稿」', () => {
    expect(cxDirectText('cx-vtu-message-draft', 'send', [])).toBe('发送草稿')
  })

  it('未登记物料直发退化 selection 文本(args[0])', () => {
    expect(cxDirectText('cx-vtu-unknown', 'whatever', [['a', 'b']])).toBe('a, b')
  })
})

describe('cxAppendText 暂存回写文本', () => {
  it('question-flow: select 「已选:X」/ step-change 「切换步骤:X」', () => {
    expect(cxAppendText('cx-vtu-question-flow', 'select', [['a', 'b']])).toBe('已选:a, b')
    expect(cxAppendText('cx-vtu-question-flow', 'step-change', ['s2'])).toBe('切换步骤:s2')
  })

  it('message-draft: undo 固定「撤销草稿」', () => {
    expect(cxAppendText('cx-vtu-message-draft', 'undo', [])).toBe('撤销草稿')
  })

  it('默认(表单 change):整值 JSON 摘要,超长截断', () => {
    expect(cxAppendText('cx-vtu-preferences-panel', 'change', [{ notif: true }])).toBe(
      '参数:{"notif":true}'
    )
    const long = { k: 'x'.repeat(80) }
    const text = cxAppendText('cx-vtu-parameter-slider', 'change', [long])
    expect(text.length).toBeLessThanOrEqual('参数:'.length + 61)
    expect(text.endsWith('…')).toBe(true)
  })
})

describe('cxEventToAppend 字段键推导与幂等 id', () => {
  it('id 为 widgetId:fieldId;label 默认取 text,可覆盖', () => {
    const item = cxEventToAppend('cx-vtu-preferences-panel', 'change', [{ notif: true }], 'w1')
    expect(item.id).toBe('w1:notif')
    expect(item.widgetId).toBe('w1')
    expect(item.fieldId).toBe('notif')
    expect(item.label).toBe(item.text)
    expect(cxEventToAppend('cx-vtu-preferences-panel', 'change', [{ notif: true }], 'w1', '通知').label).toBe('通知')
  })

  it('preferences-panel: 载荷整值对象取首键;非对象退化事件名', () => {
    expect(cxEventToAppend('cx-vtu-preferences-panel', 'change', [{ a: 1, b: 2 }], 'w').fieldId).toBe('a')
    expect(cxEventToAppend('cx-vtu-preferences-panel', 'change', [[1, 2]], 'w').fieldId).toBe('change')
    expect(cxEventToAppend('cx-vtu-preferences-panel', 'change', [], 'w').fieldId).toBe('change')
  })

  it('parameter-slider: 载荷 SliderValue[] 取首滑块 id;取不到退化事件名', () => {
    expect(
      cxEventToAppend('cx-vtu-parameter-slider', 'change', [[{ id: 'temp', value: 0.7 }]], 'w').fieldId
    ).toBe('temp')
    expect(cxEventToAppend('cx-vtu-parameter-slider', 'change', [[]], 'w').fieldId).toBe('change')
  })

  it('question-flow: select 为 select:<值>,其余事件退化事件名', () => {
    expect(cxEventToAppend('cx-vtu-question-flow', 'select', [['a']], 'w').fieldId).toBe('select:a')
    expect(cxEventToAppend('cx-vtu-question-flow', 'step-change', ['s2'], 'w').fieldId).toBe('step-change')
  })

  it('message-draft 固定 body;未登记物料退化事件名', () => {
    expect(cxEventToAppend('cx-vtu-message-draft', 'undo', [], 'w').fieldId).toBe('body')
    expect(cxEventToAppend('cx-vtu-unknown', 'whatever', [], 'w').fieldId).toBe('whatever')
  })
})

describe('cxConfirmText 确认连发文本', () => {
  it('三档语义词:完成问卷 / 应用设置 / 确认执行', () => {
    expect(cxConfirmText('cx-vtu-question-flow', [])).toBe('完成问卷')
    expect(cxConfirmText('cx-vtu-preferences-panel', [])).toBe('应用设置')
    expect(cxConfirmText('cx-vtu-parameter-slider', [])).toBe('应用设置')
    expect(cxConfirmText('cx-vtu-approval-card', [])).toBe('确认执行')
  })

  it('有暂存时拼接:暂存以；相连,再接，+语义', () => {
    expect(cxConfirmText('cx-vtu-preferences-panel', ['参数:{"notif":true}'])).toBe(
      '参数:{"notif":true}，应用设置'
    )
    expect(cxConfirmText('cx-vtu-question-flow', ['已选:a', '切换步骤:s2'])).toBe(
      '已选:a；切换步骤:s2，完成问卷'
    )
  })
})

describe('cxSelectionToText 选择值文本', () => {
  it('数组逗号连接;null/undefined 空串;其余 String', () => {
    expect(cxSelectionToText(['a', 'b'])).toBe('a, b')
    expect(cxSelectionToText(null)).toBe('')
    expect(cxSelectionToText(undefined)).toBe('')
    expect(cxSelectionToText('recommend')).toBe('recommend')
    expect(cxSelectionToText(0)).toBe('0')
  })
})

describe('defineCxEventSemantics 覆盖点', () => {
  it('dispositions 键级合并:覆盖生效,同物料其余键保持默认', () => {
    const sem = defineCxEventSemantics({
      dispositions: { 'cx-vtu-option-list': { change: 'append' } },
    })
    expect(sem.classify('cx-vtu-option-list', 'change')).toEqual({ kind: 'append' })
    expect(sem.classify('cx-vtu-option-list', 'action')).toEqual({ kind: 'direct' })
    expect(sem.classify('cx-vtu-approval-card', 'confirm')).toEqual({ kind: 'confirm' })
  })

  it('文案覆盖:返回字符串生效,返回 undefined 落默认', () => {
    const sem = defineCxEventSemantics({
      directText: (key, event) =>
        key === 'cx-vtu-message-draft' && event === 'send' ? '自定义发送' : undefined,
      confirmText: (key, texts) =>
        key === 'cx-vtu-approval-card' ? `已确认(${texts.length})` : undefined,
    })
    expect(sem.directText('cx-vtu-message-draft', 'send', [])).toBe('自定义发送')
    expect(sem.directText('cx-vtu-option-list', 'change', [['x']])).toBe('x')
    expect(sem.confirmText('cx-vtu-approval-card', ['a'])).toBe('已确认(1)')
    expect(sem.confirmText('cx-vtu-question-flow', ['a'])).toBe('a，完成问卷')
    expect(sem.appendText('cx-vtu-message-draft', 'undo', [])).toBe('撤销草稿')
  })

  it('eventToAppend 跟随 appendText 覆盖', () => {
    const sem = defineCxEventSemantics({
      appendText: () => '自定义摘要',
    })
    const item = sem.eventToAppend('cx-vtu-message-draft', 'undo', [], 'w1')
    expect(item.text).toBe('自定义摘要')
    expect(item.id).toBe('w1:body')
  })

  it('空覆盖等价默认实例', () => {
    const sem = defineCxEventSemantics()
    expect(sem.classify('cx-vtu-option-list', 'change')).toEqual(classifyCxEvent('cx-vtu-option-list', 'change'))
    expect(sem.directText('cx-vtu-option-list', 'change', [['x']])).toBe(
      cxDirectText('cx-vtu-option-list', 'change', [['x']])
    )
  })
})
