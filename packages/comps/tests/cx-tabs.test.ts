import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import { CxTabs } from '../src/index'
import CxTabsUI from '../src/tabs/src/index.vue'

/**
 * cx-tabs 标签页容器物料测试。
 * 行为契约：tabs data（[{key,label}]）驱动插槽声明（tab-<key>）与 tab 头；
 * 激活态缺省取首 tab、props.activeKey 失效时回落首 tab、点击 tab 头切换
 * （v-show 语义：非激活面板 DOM 保留仅隐藏）。
 * 半受控语义（对齐 el-tabs currentName）：activeKey 按值同步（流式回放每帧
 * 重建 props 引用但值未变时不冲刷用户点击的内部态），tabs 集合变化只做失效
 * 校正；点击经 change emit 外抛 data-out 通道。
 * 分层：meta/slots 声明断言走 define 产物；UI 交互直接 mount 内部 UI 组件，
 * 不被 define 包装层的 comp prop 传递机制干扰。
 */
const TABS = [
  { key: 'a', label: '甲' },
  { key: 'b', label: '乙' },
]

const mountTabs = (props: Record<string, any>, panels = true) =>
  mount(CxTabsUI, {
    props,
    slots: panels
      ? {
          'tab-a': '<div class="panel-a">面板甲</div>',
          'tab-b': '<div class="panel-b">面板乙</div>',
        }
      : {},
  })

describe('cx-tabs 标签页容器物料', () => {
  it('define 装配：meta key 与函数式 slots 声明', () => {
    expect((CxTabs as any)._cx_meta.key).toBe('cx-tabs')
    const slotsDecl = (CxTabs as any)._cx_meta.slots
    expect(typeof slotsDecl).toBe('function')
    const slots = slotsDecl({ comp: { data: { tabs: TABS } } })
    expect(slots.map((s: any) => s.key)).toEqual(['tab-a', 'tab-b'])
    // 非法项被过滤，不产出插槽
    const dirty = slotsDecl({
      comp: { data: { tabs: [{ key: 'x' }, { label: '无key' }, null] } },
    })
    expect(dirty.map((s: any) => s.key)).toEqual(['tab-x'])
  })

  it('默认激活首 tab 并展示对应面板', () => {
    const wrapper = mountTabs({ tabs: TABS })
    const tabs = wrapper.findAll('[role="tab"]')
    expect(tabs).toHaveLength(2)
    expect(tabs[0]!.attributes('aria-selected')).toBe('true')
    expect(tabs[1]!.attributes('aria-selected')).toBe('false')
    const panels = wrapper.findAll('[role="tabpanel"]')
    expect(panels).toHaveLength(2)
    // v-show 实现语义：非激活面板 inline display:none，DOM 保留
    expect(panels[0]!.attributes('style') ?? '').not.toContain('display: none')
    expect(panels[1]!.attributes('style') ?? '').toContain('display: none')
  })

  it('点击 tab 头切换激活面板，非激活面板 DOM 保留', async () => {
    const wrapper = mountTabs({ tabs: TABS })
    await wrapper.findAll('[role="tab"]')[1]!.trigger('click')
    const panels = wrapper.findAll('[role="tabpanel"]')
    expect(panels[0]!.attributes('style') ?? '').toContain('display: none')
    expect(panels[1]!.attributes('style') ?? '').not.toContain('display: none')
    // v-show 语义：隐藏面板仍在 DOM 中
    expect(wrapper.find('.panel-a').exists()).toBe(true)
  })

  it('activeKey 为 data-in 通道：合法值激活对应 tab，非法值回落首 tab', async () => {
    const wrapper = mountTabs({ tabs: TABS, activeKey: 'b' })
    expect(wrapper.findAll('[role="tab"]')[1]!.attributes('aria-selected')).toBe('true')
    await wrapper.setProps({ activeKey: 'not-exist' })
    expect(wrapper.findAll('[role="tab"]')[0]!.attributes('aria-selected')).toBe('true')
  })

  it('tabs 缺省/为空时不渲染 tab 头，不崩溃', () => {
    const wrapper = mountTabs({ tabs: [] }, false)
    expect(wrapper.findAll('[role="tab"]')).toHaveLength(0)
    expect(wrapper.findAll('[role="tabpanel"]')).toHaveLength(0)
  })

  it('流式引用抖动不冲刷用户点击：tabs 同值新引用时保持内部选择', async () => {
    const wrapper = mountTabs({ tabs: TABS, activeKey: 'a' })
    await wrapper.findAll('[role="tab"]')[1]!.trigger('click')
    expect(wrapper.findAll('[role="tab"]')[1]!.attributes('aria-selected')).toBe('true')
    // 模拟流式回放帧：同值内容、全新引用的 tabs 数组
    await wrapper.setProps({
      tabs: TABS.map((t) => ({ ...t })),
      activeKey: 'a',
    })
    expect(wrapper.findAll('[role="tab"]')[1]!.attributes('aria-selected')).toBe('true')
    expect(wrapper.findAll('[role="tab"]')[0]!.attributes('aria-selected')).toBe('false')
  })

  it('activeKey 值变化仍驱动切换（伪联动语义）', async () => {
    const wrapper = mountTabs({ tabs: TABS, activeKey: 'a' })
    await wrapper.setProps({ activeKey: 'b' })
    expect(wrapper.findAll('[role="tab"]')[1]!.attributes('aria-selected')).toBe('true')
  })

  it('tabs 流式后至：集合到达先回落首 tab，activeKey 可解析即落地', async () => {
    const wrapper = mountTabs({ tabs: [], activeKey: 'b' }, false)
    // 首帧 tabs 未到位，activeKey 暂无法落地，回落首个可用 tab
    await wrapper.setProps({ tabs: [TABS[0]!] })
    expect(wrapper.findAll('[role="tab"]')[0]!.attributes('aria-selected')).toBe('true')
    // 第二帧 b 到位：activeKey 可解析即激活——中途的外部驱动（伪联动）不丢
    await wrapper.setProps({ tabs: TABS })
    expect(wrapper.findAll('[role="tab"]')[1]!.attributes('aria-selected')).toBe('true')
    expect(wrapper.findAll('[role="tab"]')[0]!.attributes('aria-selected')).toBe('false')
  })

  it('点击切换经 change emit 外抛 data-out 通道，重复点击不重复抛', async () => {
    const wrapper = mountTabs({ tabs: TABS })
    await wrapper.findAll('[role="tab"]')[1]!.trigger('click')
    await wrapper.findAll('[role="tab"]')[1]!.trigger('click')
    expect(wrapper.emitted('change')).toEqual([[{ key: 'b' }]])
    expect((CxTabs as any)._cx_meta.emits?.change).toBeTruthy()
  })
})
