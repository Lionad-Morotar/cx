import { describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { CxRender } from '@lionad/cx-render'
import { normalize } from '@lionad/cx-definition'

import CxDailyStandardDashboardPageLayout from '../app/standup/components/daily-standup-dashboard/daily-standard-dashboard-page-layout'
import CxWeeklyStandardDashboardPageLayout from '../app/standup/components/weekly-standup-dashboard/weekly-standard-dashboard-page-layout'
import { comp, createTestCx, installMaterials } from './helpers/cx-render-test'

import type { CxComponentRuntime } from '@lionad/cx-definition'

/**
 * 日会/周会详情页 schema 化的机制验证与结构断言。
 *
 * 机制验证：page-layout 物料用函数式 h()+renderSlot（而非 SFC <slot name>），
 * CxRender 经动态具名 slot 传 schema 子节点的兼容性此前只在 SFC 形态的
 * folder-container 上验证过，这里用最小占位物料单独实证函数式形态。
 *
 * 其余 describe 块为日会/周会 schema 的静态骨架结构断言。
 */

// 最小占位物料：避开真实物料的 router/store 依赖，纯粹验证 slot 通道
const makeTracerContent = (marker: string) =>
  normalize({
    name: marker,
    key: `cx-tracer-${marker}`,
    component: defineComponent({
      name: `tracer-${marker}`,
      setup: () => () => h('div', { class: `tracer-${marker}` }, marker),
    }),
  })

const CxTracerA = makeTracerContent('a')
const CxTracerB = makeTracerContent('b')

describe('机制验证：page-layout 具名 slot 经 schema 填充', () => {
  it('日会 page-layout 的 page-header slot 渲染占位物料到对应 wrapper div', async () => {
    const schema = [
      comp(
        'daily-layout',
        'cx-daily-standard-dashboard-page-layout',
        {},
        {
          'page-header': [comp('tracer-a', 'cx-tracer-a')],
        },
      ),
    ]
    const cx = createTestCx()
    installMaterials(cx, { CxDailyStandardDashboardPageLayout, CxTracerA })
    const wrapper = mount(CxRender, { props: { cx: cx as never, components: schema } })
    await flushPromises()
    await flushPromises()

    // page-layout 内部为每个声明 slot 包了 <div class="page-xxx standup-slot">
    const pageHeaderDiv = wrapper.find('.page-header')
    expect(pageHeaderDiv.exists()).toBe(true)
    expect(pageHeaderDiv.find('.tracer-a').exists()).toBe(true)
  })

  it('周会 page-layout 的 page-header-center slot 经 schema 填充（slot 名与日会不同）', async () => {
    const schema = [
      comp(
        'weekly-layout',
        'cx-weekly-standup-dashboard-page-layout',
        {},
        {
          'page-header-center': [comp('tracer-b', 'cx-tracer-b')],
        },
      ),
    ]
    const cx = createTestCx()
    installMaterials(cx, { CxWeeklyStandardDashboardPageLayout, CxTracerB })
    const wrapper = mount(CxRender, { props: { cx: cx as never, components: schema } })
    await flushPromises()
    await flushPromises()

    const pageHeaderCenterDiv = wrapper.find('.page-header-center')
    expect(pageHeaderCenterDiv.exists()).toBe(true)
    expect(pageHeaderCenterDiv.find('.tracer-b').exists()).toBe(true)
  })
})

describe('日会 schema 静态骨架', () => {
  // CxComponentRuntime 的递归类型在嵌套访问时退化为内层基础类型，需 cast（与列表页测试一致）
  const asComp = (x: unknown) => x as CxComponentRuntime

  it('根为 daily page-layout，5 个具名 slot 各填正确内容物料', async () => {
    const { dailyStandupDashboardSchema } =
      await import('../app/standup/schemas/daily-standup-dashboard.schema')
    const root = asComp(dailyStandupDashboardSchema[0])
    expect(root.key).toBe('cx-daily-standard-dashboard-page-layout')

    const slots = root.components!
    expect(asComp(slots['page-header']?.[0]).key).toBe('cx-daily-standup-header-info')
    expect(asComp(slots['page-header-right']?.[0]).key).toBe('cx-daily-page-actions')
    expect(asComp(slots['page-content-left']?.[0]).key).toBe('cx-daily-standup-filter')
    expect(asComp(slots['page-content-main']?.[0]).key).toBe('cx-daily-main-content')
    expect(asComp(slots['page-content-right']?.[0]).key).toBe('cx-user-select')
  })
})

describe('周会 schema 静态骨架', () => {
  const asComp = (x: unknown) => x as CxComponentRuntime

  it('根为 weekly page-layout，5 个具名 slot（名与日会不同）各填正确内容物料', async () => {
    const { weeklyStandupDashboardSchema } =
      await import('../app/standup/schemas/weekly-standup-dashboard.schema')
    const root = asComp(weeklyStandupDashboardSchema[0])
    expect(root.key).toBe('cx-weekly-standup-dashboard-page-layout')

    const slots = root.components!
    expect(asComp(slots['page-header-center']?.[0]).key).toBe('cx-weekly-user-info-and-time')
    expect(asComp(slots['page-header-right']?.[0]).key).toBe('cx-weekly-page-actions')
    expect(asComp(slots['page-main-section']?.[0]).key).toBe('cx-weekly-main-content')
    expect(asComp(slots['page-aside-section']?.[0]).key).toBe('cx-weekly-todo-card')
    expect(asComp(slots['page-right-section']?.[0]).key).toBe('cx-user-select')
  })
})
