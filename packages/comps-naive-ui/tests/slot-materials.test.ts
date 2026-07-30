import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import { CxNaiveUi } from '../src/index'

/**
 * 插槽容器：card（default + header 具名双插槽）/ space（default 多子节点）。
 * card 的 slots meta 必须同时声明 default 与 header——对象形态 slots meta 经 mapValues
 * 只产出显式声明的键，漏 default 则渲染器不生成默认插槽子物料（静态 meta 断言守护）。
 */
const fakeComp = (key: string) => ({ id: `test-${key}`, key, data: {}, components: {} })

const byKey = (key: string) => CxNaiveUi.find((x: any) => x._cx_meta.key === key)!

describe('card 插槽容器', () => {
  it('slots meta 同时声明 default 与 header（mapValues 陷阱守护）', () => {
    const meta = byKey('cx-naive-ui-card')._cx_meta as any
    expect(Object.keys(meta.slots)).toEqual(expect.arrayContaining(['default', 'header']))
  })

  it('default 与 header 插槽内容同时渲染', () => {
    // naive card 内部类名为单横杠 BEM（n-card-content / n-card-header），区别于 EP 双下划线
    const comp = byKey('cx-naive-ui-card')
    const wrapper = mount(comp as any, {
      props: { comp: fakeComp('cx-naive-ui-card') },
      slots: {
        default: '<p class="probe-body">主体内容探针</p>',
        header: '<span class="probe-header">头部探针</span>',
      },
    })
    expect(wrapper.find('.n-card').exists()).toBe(true)
    expect(wrapper.find('.n-card-header .probe-header').exists()).toBe(true)
    expect(wrapper.find('.n-card-content .probe-body').exists()).toBe(true)
  })

  it('size 配置到达 NCard（inline CSS 变量证据）', () => {
    const comp = byKey('cx-naive-ui-card')
    const wMedium = mount(comp as any, { props: { comp: fakeComp('cx-naive-ui-card'), size: 'medium' } })
    const wSmall = mount(comp as any, { props: { comp: fakeComp('cx-naive-ui-card'), size: 'small' } })
    expect(wSmall.find('.n-card').attributes('style')).not.toBe(wMedium.find('.n-card').attributes('style'))
  })
})

describe('space 插槽容器', () => {
  it('default 插槽渲染多个子节点', () => {
    const comp = byKey('cx-naive-ui-space')
    const wrapper = mount(comp as any, {
      props: { comp: fakeComp('cx-naive-ui-space') },
      slots: {
        default: '<i class="probe-a">甲</i><i class="probe-b">乙</i>',
      },
    })
    expect(wrapper.find('.n-space').exists()).toBe(true)
    expect(wrapper.find('.probe-a').exists()).toBe(true)
    expect(wrapper.find('.probe-b').exists()).toBe(true)
  })

  it('vertical 配置到达 NSpace（inline CSS 变量证据）', () => {
    const comp = byKey('cx-naive-ui-space')
    const wHorizontal = mount(comp as any, {
      props: { comp: fakeComp('cx-naive-ui-space'), vertical: false },
      slots: { default: '<i>甲</i>' },
    })
    const wVertical = mount(comp as any, {
      props: { comp: fakeComp('cx-naive-ui-space'), vertical: true },
      slots: { default: '<i>甲</i>' },
    })
    expect(wVertical.find('.n-space').attributes('style')).not.toBe(
      wHorizontal.find('.n-space').attributes('style'),
    )
  })
})
