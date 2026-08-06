import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { ItemCarousel } from '@lionad/vtu-components'

import { CxVtu } from '../src/index'

/**
 * 物料 emits 契约:meta emits 声明与包装件 SFC defineEmits 同集合,
 * vtu 函数型 prop(on*)经包装件 re-emit 为 Vue emit 上抛——
 * cx 渲染器 getEmits 命中 meta 声明后经 _cx_events 接到 host 事件总线。
 * data-table 行级 link-click 为包装件 DOM 委托(物料边界内),携带行内容与列定义。
 */
const fakeComp = (key: string) => ({ id: `test-${key}`, key, data: {}, components: {} })

const mountMaterial = (comp: any, props: Record<string, any> = {}) =>
  mount(comp, {
    props: { comp: fakeComp(comp._cx_meta?.key || 'x'), ...props },
    global: {
      directives: { cx: { mounted() {} } },
      provide: { cx: undefined, 'is-cx-edit': false, 'is-cx-debug': false },
    },
  })

const byKey = (key: string) => CxVtu.find((x: any) => x._cx_meta.key === key)!

/** 包装件 SFC 的运行时 emits 声明(类型驱动 defineEmits 编译产物) */
function sfcEmits(comp: any): string[] {
  const raw = comp.emits
  if (Array.isArray(raw)) return raw
  if (raw && typeof raw === 'object') return Object.keys(raw)
  return []
}

/** meta emits 声明键清单 */
function metaEmits(comp: any): string[] {
  return Object.keys(comp._cx_meta.emits ?? {})
}

describe('物料 emits · meta 与 SFC 同集合', () => {
  const CASES: Array<[string, string[]]> = [
    ['cx-vtu-preferences-panel', ['change', 'action']],
    ['cx-vtu-question-flow', ['select', 'back', 'step-change', 'complete']],
    ['cx-vtu-message-draft', ['send', 'undo', 'cancel']],
    ['cx-vtu-parameter-slider', ['change', 'action']],
    ['cx-vtu-item-carousel', ['item-click', 'item-action']],
    ['cx-vtu-data-table', ['link-click']],
  ]
  for (const [key, expected] of CASES) {
    it(`${key}: ${expected.join('/')}`, () => {
      const comp = byKey(key)
      expect(metaEmits(comp).sort()).toEqual([...expected].sort())
      expect(sfcEmits(comp).sort()).toEqual([...expected].sort())
    })
  }
})

describe('物料 emits · vtu 函数 prop re-emit', () => {
  it('preferences-panel: onChange/onAction/onUpdate:value 上抛', async () => {
    const comp = byKey('cx-vtu-preferences-panel')
    const wrapper = mountMaterial(comp, {
      sections: [
        {
          heading: '通用',
          items: [{ id: 'notif', label: '开启通知', type: 'switch', defaultChecked: true }],
        },
      ],
    })
    const inner = wrapper.findComponent({ name: 'CmptPreferencesPanel' })
    const props = inner.props() as Record<string, any>
    props.onChange?.({ notif: false })
    props.onAction?.('save', { notif: false })
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('change')).toBeTruthy()
    expect(wrapper.emitted('action')?.[0]).toEqual(['save', { notif: false }])
  })

  it('question-flow: onSelect/onBack/onStepChange/onComplete 上抛', async () => {
    const comp = byKey('cx-vtu-question-flow')
    const wrapper = mountMaterial(comp, {
      steps: [
        {
          id: 'q1',
          title: '你偏好哪种渲染方式？',
          selectionMode: 'single',
          options: [
            { id: 'a', label: 'Schema 驱动' },
            { id: 'b', label: '手写组件' },
          ],
        },
      ],
    })
    const inner = wrapper.findComponent({ name: 'CmptQuestionFlow' })
    const props = inner.props() as Record<string, any>
    props.onSelect?.(['a'])
    props.onBack?.()
    props.onStepChange?.('q1')
    props.onComplete?.({ q1: ['a'] })
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('select')?.[0]).toEqual([['a']])
    expect(wrapper.emitted('back')).toBeTruthy()
    expect(wrapper.emitted('step-change')?.[0]).toEqual(['q1'])
    expect(wrapper.emitted('complete')?.[0]).toEqual([{ q1: ['a'] }])
  })

  it('message-draft: onSend/onUndo/onCancel 上抛', async () => {
    const comp = byKey('cx-vtu-message-draft')
    const wrapper = mountMaterial(comp, {
      type: 'email',
      body: '你好，这是一封待发送的草稿邮件。',
      subject: '关于下周的同步',
      to: ['team@example.com'],
    })
    const inner = wrapper.findComponent({ name: 'CmptMessageDraft' })
    const props = inner.props() as Record<string, any>
    props.onSend?.()
    props.onUndo?.()
    props.onCancel?.()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('send')).toBeTruthy()
    expect(wrapper.emitted('undo')).toBeTruthy()
    expect(wrapper.emitted('cancel')).toBeTruthy()
  })

  it('parameter-slider: onChange/onAction 上抛', async () => {
    const comp = byKey('cx-vtu-parameter-slider')
    const wrapper = mountMaterial(comp, {
      sliders: [{ id: 'temp', label: '温度', min: 0, max: 100, step: 1, value: 42, unit: '°C' }],
    })
    const inner = wrapper.findComponent({ name: 'CmptParameterSlider' })
    const props = inner.props() as Record<string, any>
    const next = [{ id: 'temp', label: '温度', min: 0, max: 100, step: 1, value: 50, unit: '°C' }]
    props.onChange?.(next)
    props.onAction?.('apply', next)
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('change')).toBeTruthy()
    expect(wrapper.emitted('action')?.[0]).toEqual(['apply', next])
  })

  it('item-carousel: onItemClick/onItemAction 上抛', async () => {
    const comp = byKey('cx-vtu-item-carousel')
    const wrapper = mountMaterial(comp, {
      items: [{ id: 'i1', name: '条目一', subtitle: '副标题', image: 'https://example.com/i1.png' }],
    })
    const inner = wrapper.findComponent(ItemCarousel)
    const props = inner.props() as Record<string, any>
    props.onItemClick?.('i1')
    props.onItemAction?.('i1', 'open')
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('item-click')?.[0]).toEqual(['i1'])
    expect(wrapper.emitted('item-action')?.[0]).toEqual(['i1', 'open'])
  })
})

describe('物料 emits · data-table 行级 link-click(DOM 委托)', () => {
  const columns = [
    { key: 'name', title: '姓名' },
    { key: 'dept', title: '部门' },
    { key: 'detail', title: '详情', format: { kind: 'link', hrefKey: 'url' } },
  ]
  const data = [
    { name: '张三', dept: '研发', url: 'https://example.com/u/1' },
    { name: '李四', dept: '设计', url: 'https://example.com/u/2' },
  ]

  it('link 列点击 emit 携带行序号/文案/行内容/列定义/href,且阻止默认导航', async () => {
    const comp = byKey('cx-vtu-data-table')
    const wrapper = mountMaterial(comp, { columns, data })
    await wrapper.vm.$nextTick()
    const anchor = wrapper.find('tbody tr:nth-child(2) td:nth-child(3) a')
    expect(anchor.exists()).toBe(true)
    await anchor.trigger('click')
    const emitted = wrapper.emitted('link-click')
    expect(emitted).toBeTruthy()
    const payload = emitted![0]![0] as Record<string, any>
    expect(payload.rowIndex).toBe(1)
    expect(payload.text.length).toBeGreaterThan(0)
    expect(payload.row).toEqual(['李四', '设计', expect.any(String)])
    expect(payload.column).toMatchObject({ key: 'detail' })
    expect(payload.href).toBe('https://example.com/u/2')
  })

  it('非 link 列单元格点击不触发 link-click', async () => {
    const comp = byKey('cx-vtu-data-table')
    const wrapper = mountMaterial(comp, { columns, data })
    await wrapper.vm.$nextTick()
    const cell = wrapper.find('tbody tr:nth-child(1) td:nth-child(1)')
    await cell.trigger('click')
    expect(wrapper.emitted('link-click')).toBeFalsy()
  })
})
