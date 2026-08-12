import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { ItemCarousel } from '@lionad/vtu-components'

import { CxVtu } from '../src/index'

/**
 * 物料 emits 契约:meta emits 声明与包装件 SFC defineEmits 同集合,
 * vtu 事件经包装件 re-emit 为 Vue emit 上抛——
 * cx 渲染器 getEmits 命中 meta 声明后经 _cx_events 接到 host 事件总线。
 * data-table 行级 link-click 为包装件 DOM 委托(物料边界内),携带行内容与列定义。
 *
 * 上抛用例一律经 inner.vm.$emit 驱动而非直调 props.on*——$emit 走与生产一致的
 * vnode props handler 查找(emit 找 camel 键 onXxx),能锁死「:on-* kebab v-bind
 * 永远等不到真 emit」这类绑定形态错误;直调 props 则两种绑定形态都通过,失去回归意义。
 * message-draft 是例外:vtu 对 send/undo/cancel 双通道(先调函数 prop 再 emit),
 * 包装件刻意保留 kebab v-bind 走 props 单通道防双发,故该用例仍直调 props.on* 并断言单发。
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
    ['cx-vtu-option-list', ['action', 'change', 'update:modelValue']],
    ['cx-vtu-approval-card', ['confirm', 'cancel']],
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

describe('物料 emits · vtu 真 emit 上抛', () => {
  it('option-list: change 载荷翻译为 label 上抛;action 载荷附按钮 label', async () => {
    const comp = byKey('cx-vtu-option-list')
    const wrapper = mountMaterial(comp, {
      options: [
        { id: 'opt-1', label: '选项一' },
        { id: 'opt-2', label: '选项二' },
      ],
      actions: [{ id: 'confirm', label: '查看结果' }],
    })
    const inner = wrapper.findComponent({ name: 'CmptOptionList' })
    inner.vm.$emit('change', 'opt-1')
    inner.vm.$emit('action', 'confirm', 'opt-1')
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('change')?.[0]).toEqual(['选项一'])
    expect(wrapper.emitted('action')?.[0]).toEqual(['confirm', 'opt-1', '查看结果'])
  })

  it('option-list: action 的 actionId 查不到 label 时第三参 undefined(语义层落兜底)', async () => {
    const comp = byKey('cx-vtu-option-list')
    const wrapper = mountMaterial(comp, {
      options: [{ id: 'opt-1', label: '选项一' }],
    })
    const inner = wrapper.findComponent({ name: 'CmptOptionList' })
    inner.vm.$emit('action', 'confirm', 'opt-1')
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('action')?.[0]).toEqual(['confirm', 'opt-1', undefined])
  })

  it('option-list: change 多选逐个翻译,未知 id 退化原样上抛', async () => {
    const comp = byKey('cx-vtu-option-list')
    const wrapper = mountMaterial(comp, {
      options: [
        { id: 'opt-1', label: '选项一' },
        { id: 'opt-2', label: '选项二' },
      ],
    })
    const inner = wrapper.findComponent({ name: 'CmptOptionList' })
    inner.vm.$emit('change', ['opt-1', 'opt-2'])
    inner.vm.$emit('change', ['opt-1', 'ghost'])
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('change')?.[0]).toEqual([['选项一', '选项二']])
    expect(wrapper.emitted('change')?.[1]).toEqual([['选项一', 'ghost']])
  })

  it('approval-card: confirm 上抛附 confirmLabel,cancel 同前', async () => {
    const comp = byKey('cx-vtu-approval-card')
    const wrapper = mountMaterial(comp, { title: '发布审批', confirmLabel: '允许发布' })
    const inner = wrapper.findComponent({ name: 'CmptApprovalCard' })
    inner.vm.$emit('confirm')
    inner.vm.$emit('cancel')
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('confirm')?.[0]).toEqual(['允许发布'])
    expect(wrapper.emitted('cancel')).toBeTruthy()
  })

  it('preferences-panel: change/action 上抛', async () => {
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
    inner.vm.$emit('change', { notif: false })
    inner.vm.$emit('action', 'save', { notif: false })
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('change')?.[0]).toEqual([{ notif: false }])
    // 未配 actions:label 第三参 undefined(语义层落兜底「保存」)
    expect(wrapper.emitted('action')?.[0]).toEqual(['save', { notif: false }, undefined])
  })

  it('question-flow: select 对象载荷(选项 id + label + 步骤 id)上抛,back/stepChange/complete 同前', async () => {
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
        {
          id: 'q2',
          title: '你在意哪些指标？',
          selectionMode: 'multi',
          options: [
            { id: 'c', label: '首屏耗时' },
            { id: 'd', label: '交互延迟' },
          ],
        },
      ],
    })
    const inner = wrapper.findComponent({ name: 'CmptQuestionFlow' })
    inner.vm.$emit('select', ['a'])
    inner.vm.$emit('back')
    // vtu 原生事件名是 camelCase 的 stepChange;包装件 re-emit 回宿主侧为 kebab step-change,
    // 并跟踪为当前步骤(select 载荷的 stepId 来源)
    inner.vm.$emit('stepChange', 'q2')
    inner.vm.$emit('select', ['c', 'd'])
    inner.vm.$emit('complete', { q1: ['a'], q2: ['c', 'd'] })
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('select')?.[0]).toEqual([
      { optionIds: ['a'], labels: ['Schema 驱动'], stepId: 'q1' },
    ])
    expect(wrapper.emitted('back')).toBeTruthy()
    expect(wrapper.emitted('step-change')?.[0]).toEqual(['q2'])
    expect(wrapper.emitted('select')?.[1]).toEqual([
      { optionIds: ['c', 'd'], labels: ['首屏耗时', '交互延迟'], stepId: 'q2' },
    ])
    expect(wrapper.emitted('complete')?.[0]).toEqual([{ q1: ['a'], q2: ['c', 'd'] }])
  })

  it('message-draft: send/undo/cancel 经函数 prop 单通道上抛(防双发)', async () => {
    const comp = byKey('cx-vtu-message-draft')
    const wrapper = mountMaterial(comp, {
      type: 'email',
      body: '你好，这是一封待发送的草稿邮件。',
      subject: '关于下周的同步',
      to: ['team@example.com'],
    })
    const inner = wrapper.findComponent({ name: 'CmptMessageDraft' })
    // vtu MessageDraft 双通道(先调 props.onSend 再 emit send):生产命中 props 通道,
    // kebab 绑定使 emit 通道查不到 handler——断言每事件恰好上抛一次,锁死防双发形态
    const props = inner.props() as Record<string, any>
    props.onSend?.()
    props.onUndo?.()
    props.onCancel?.()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('send')!.length).toBe(1)
    expect(wrapper.emitted('undo')!.length).toBe(1)
    expect(wrapper.emitted('cancel')!.length).toBe(1)
  })

  it('parameter-slider: change/action 上抛', async () => {
    const comp = byKey('cx-vtu-parameter-slider')
    const wrapper = mountMaterial(comp, {
      sliders: [{ id: 'temp', label: '温度', min: 0, max: 100, step: 1, value: 42, unit: '°C' }],
    })
    const inner = wrapper.findComponent({ name: 'CmptParameterSlider' })
    const next = [{ id: 'temp', label: '温度', min: 0, max: 100, step: 1, value: 50, unit: '°C' }]
    inner.vm.$emit('change', next)
    inner.vm.$emit('action', 'apply', next)
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('change')?.[0]).toEqual([next])
    expect(wrapper.emitted('action')?.[0]).toEqual(['apply', next, undefined])
  })

  it('item-carousel: itemClick/itemAction 上抛', async () => {
    const comp = byKey('cx-vtu-item-carousel')
    const wrapper = mountMaterial(comp, {
      items: [{ id: 'i1', name: '条目一', subtitle: '副标题', image: 'https://example.com/i1.png' }],
    })
    const inner = wrapper.findComponent(ItemCarousel)
    // vtu 原生事件名是 camelCase 的 itemClick/itemAction;re-emit 回宿主侧为 kebab
    inner.vm.$emit('itemClick', 'i1')
    inner.vm.$emit('itemAction', 'i1', 'open')
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
