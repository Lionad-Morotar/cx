import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import { CxNaiveUi } from '../src/index'

/**
 * 展示类物料挂载断言：14 件（基础反馈 alert/result/empty + 数据展示 avatar/badge/progress/
 * statistic/descriptions/collapse + 导航版式 tag/divider/steps/breadcrumb/timeline）。
 * v-for 子组件族（descriptions/collapse/steps/breadcrumb/timeline）子项在父组件下一次重渲染
 * 才落 DOM，统一双 nextTick 后断言（EP 同型时序坑：子组件注册父 store 需一拍）。
 */
const fakeComp = (key: string) => ({ id: `test-${key}`, key, data: {}, components: {} })

const mountMaterial = (comp: any, props: Record<string, any> = {}) =>
  mount(comp, {
    props: { comp: fakeComp(comp._cx_meta?.key || 'x'), ...props },
  })

const byKey = (key: string) => CxNaiveUi.find((x: any) => x._cx_meta.key === key)!

const settle = async () => {
  await nextTick()
  await nextTick()
}

describe('基础反馈物料', () => {
  it('alert 渲染 title 与 content（slot），type 到达 prop', () => {
    // naive-ui 主题形态经 inline CSS 变量（style 属性）而非修饰类落地（button 为例外，
    // 模板硬编码 BEM 修饰类），故 type 生效证据为 default/success 两次挂载的 style 差异
    const wDefault = mountMaterial(byKey('cx-naive-ui-alert'), { title: 't', type: 'default' })
    const wrapper = mountMaterial(byKey('cx-naive-ui-alert'), {
      title: '操作成功',
      content: '已保存',
      type: 'success',
    })
    expect(wrapper.find('.n-alert').exists()).toBe(true)
    expect(wrapper.find('.n-alert').attributes('style')).not.toBe(
      wDefault.find('.n-alert').attributes('style'),
    )
    expect(wrapper.text()).toContain('操作成功')
    expect(wrapper.text()).toContain('已保存')
  })

  it('result 渲染 title 与 status', () => {
    const wInfo = mountMaterial(byKey('cx-naive-ui-result'), { title: 't', status: 'info' })
    const wrapper = mountMaterial(byKey('cx-naive-ui-result'), {
      title: '提交成功',
      status: 'success',
    })
    expect(wrapper.find('.n-result').exists()).toBe(true)
    expect(wrapper.find('.n-result').attributes('style')).not.toBe(
      wInfo.find('.n-result').attributes('style'),
    )
    expect(wrapper.text()).toContain('提交成功')
  })

  it('empty 渲染 description', () => {
    const wrapper = mountMaterial(byKey('cx-naive-ui-empty'), { description: '没有记录' })
    expect(wrapper.find('.n-empty').exists()).toBe(true)
    expect(wrapper.text()).toContain('没有记录')
  })
})

describe('数据展示物料', () => {
  it('avatar 渲染根元素，round 到达 prop（inline CSS 变量证据）', () => {
    const wrapper = mountMaterial(byKey('cx-naive-ui-avatar'), { round: true, size: 'large' })
    const el = wrapper.find('.n-avatar')
    expect(el.exists()).toBe(true)
    expect(el.attributes('style')).toContain('--n-border-radius: 50%')
  })

  it('badge 渲染宿主内容（slot）与徽标值', () => {
    const wrapper = mountMaterial(byKey('cx-naive-ui-badge'), { content: '消息', value: '8' })
    expect(wrapper.find('.n-badge').exists()).toBe(true)
    expect(wrapper.text()).toContain('消息')
    expect(wrapper.find('.n-badge-sup').exists()).toBe(true)
  })

  it('progress 渲染百分比数值', () => {
    const wrapper = mountMaterial(byKey('cx-naive-ui-progress'), { percentage: 42 })
    expect(wrapper.find('.n-progress').exists()).toBe(true)
    expect(wrapper.text()).toContain('42')
  })

  it('statistic 渲染 label 与 value', () => {
    const wrapper = mountMaterial(byKey('cx-naive-ui-statistic'), {
      label: '累计访问量',
      value: '12,345',
    })
    expect(wrapper.find('.n-statistic').exists()).toBe(true)
    expect(wrapper.text()).toContain('累计访问量')
    expect(wrapper.text()).toContain('12,345')
  })

  it('descriptions items 驱动渲染 label 与 value（双 tick）', async () => {
    const wrapper = mountMaterial(byKey('cx-naive-ui-descriptions'), {
      items: [{ label: '姓名', value: '张三' }],
    })
    await settle()
    expect(wrapper.find('.n-descriptions').exists()).toBe(true)
    expect(wrapper.text()).toContain('姓名')
    expect(wrapper.text()).toContain('张三')
  })

  it('collapse items 驱动渲染标题与正文，默认展开（双 tick）', async () => {
    const wrapper = mountMaterial(byKey('cx-naive-ui-collapse'), {
      items: [{ title: '第一章', content: '第一章的正文内容' }],
    })
    await settle()
    expect(wrapper.find('.n-collapse').exists()).toBe(true)
    expect(wrapper.find('.n-collapse-item').exists()).toBe(true)
    expect(wrapper.text()).toContain('第一章')
    expect(wrapper.text()).toContain('第一章的正文内容')
  })
})

describe('导航版式物料', () => {
  it('tag 渲染 label（slot）与 type', () => {
    const wDefault = mountMaterial(byKey('cx-naive-ui-tag'), { label: 'x', type: 'default' })
    const wrapper = mountMaterial(byKey('cx-naive-ui-tag'), { label: '已完成', type: 'success' })
    expect(wrapper.find('.n-tag').exists()).toBe(true)
    expect(wrapper.find('.n-tag').attributes('style')).not.toBe(
      wDefault.find('.n-tag').attributes('style'),
    )
    expect(wrapper.text()).toContain('已完成')
  })

  it('divider 渲染标题（slot）与根元素', () => {
    const wrapper = mountMaterial(byKey('cx-naive-ui-divider'), { title: '分组' })
    expect(wrapper.find('.n-divider').exists()).toBe(true)
    expect(wrapper.text()).toContain('分组')
  })

  it('steps 渲染步骤标题，active 映射 current（双 tick）', async () => {
    const wrapper = mountMaterial(byKey('cx-naive-ui-steps'), {
      steps: [{ title: '填写信息' }, { title: '确认提交' }],
      active: 1,
    })
    await settle()
    expect(wrapper.find('.n-steps').exists()).toBe(true)
    expect(wrapper.text()).toContain('填写信息')
    expect(wrapper.text()).toContain('确认提交')
  })

  it('breadcrumb items 驱动渲染层级文本（双 tick）', async () => {
    const wrapper = mountMaterial(byKey('cx-naive-ui-breadcrumb'), {
      items: [{ title: '首页' }, { title: '详情' }],
    })
    await settle()
    expect(wrapper.find('.n-breadcrumb').exists()).toBe(true)
    expect(wrapper.text()).toContain('首页')
    expect(wrapper.text()).toContain('详情')
  })

  it('timeline items 驱动渲染事件标题与时间（双 tick）', async () => {
    const wrapper = mountMaterial(byKey('cx-naive-ui-timeline'), {
      items: [{ title: '创建任务', time: '2026-07-30', type: 'success' }],
    })
    await settle()
    expect(wrapper.find('.n-timeline').exists()).toBe(true)
    expect(wrapper.text()).toContain('创建任务')
    expect(wrapper.text()).toContain('2026-07-30')
  })
})
