import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import { CxElementPlus, CxElementPlusBundle } from '../src/index'

/**
 * S5 插槽容器（card/space）+ 27 件契约冻结。
 * 对象形态 slots meta 只产出显式声明的键（render-component.vue mapValues），
 * card 必须同时声明 default 与 header，否则默认插槽子物料永不渲染（Gate 观察 #1）。
 */
const fakeComp = (key: string) => ({ id: `test-${key}`, key, data: {}, components: {} })

const byKey = (key: string) => CxElementPlus.find((x: any) => x._cx_meta.key === key)!

describe('27 件契约冻结', () => {
  it('物料集冻结为 27 件，bundle 与数组全等', () => {
    expect(CxElementPlus).toHaveLength(27)
    expect(CxElementPlusBundle.materials).toHaveLength(27)
    expect([...CxElementPlusBundle.materials]).toEqual(CxElementPlus)
  })
})

describe('cx-element-plus-card 插槽容器', () => {
  it('default 插槽子内容渲染进 card body', () => {
    const wrapper = mount(byKey('cx-element-plus-card') as any, {
      props: { comp: fakeComp('cx-element-plus-card') },
      slots: { default: '<span class="probe-body">主体内容</span>' },
    })
    expect(wrapper.find('.el-card').exists()).toBe(true)
    expect(wrapper.find('.el-card__body .probe-body').exists()).toBe(true)
  })

  it('header 具名插槽渲染进 card header 区域', () => {
    const wrapper = mount(byKey('cx-element-plus-card') as any, {
      props: { comp: fakeComp('cx-element-plus-card') },
      slots: { header: '<span class="probe-head">卡片标题</span>' },
    })
    expect(wrapper.find('.el-card__header .probe-head').exists()).toBe(true)
  })

  it('slots meta 同时声明 default 与 header（对象形态只产出声明键）', () => {
    const meta = (byKey('cx-element-plus-card') as any)._cx_meta
    expect(Object.keys(meta.slots).sort()).toEqual(['default', 'header'])
  })

  it('shadow 配置到达 EP prop', () => {
    const wrapper = mount(byKey('cx-element-plus-card') as any, {
      props: { comp: fakeComp('cx-element-plus-card'), shadow: 'never' },
    })
    expect(wrapper.find('.el-card.is-never-shadow').exists()).toBe(true)
  })
})

describe('cx-element-plus-space 插槽容器', () => {
  it('default 插槽多子节点排布', () => {
    const wrapper = mount(byKey('cx-element-plus-space') as any, {
      props: { comp: fakeComp('cx-element-plus-space') },
      slots: { default: '<button>A</button><button>B</button>' },
    })
    expect(wrapper.find('.el-space').exists()).toBe(true)
    expect(wrapper.findAll('.el-space__item').length).toBe(2)
  })

  it('direction 配置到达 EP prop', () => {
    const wrapper = mount(byKey('cx-element-plus-space') as any, {
      props: { comp: fakeComp('cx-element-plus-space'), direction: 'vertical' },
      slots: { default: '<i>x</i>' },
    })
    expect(wrapper.find('.el-space--vertical').exists()).toBe(true)
  })
})
