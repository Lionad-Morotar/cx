import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import { CxElementPlus } from '../src/index'

/**
 * S2 叶级展示物料 13 件 smoke：按形态分组断言 EP 原生行为经包装层保真。
 * A 纯透传（result/empty/avatar/progress/statistic/divider）
 * B label 插槽（link/tag/badge）
 * C JSON 子组件（descriptions/steps/breadcrumb/timeline）
 */
const fakeComp = (key: string) => ({ id: `test-${key}`, key, data: {}, components: {} })

const mountMaterial = (comp: any, props: Record<string, any> = {}) =>
  mount(comp, {
    props: { comp: fakeComp(comp._cx_meta?.key || 'x'), ...props },
  })

const byKey = (key: string) => CxElementPlus.find((x: any) => x._cx_meta.key === key)!

describe('A 纯透传类', () => {
  it('cx-element-plus-result 渲染 title 与 success 图标态', () => {
    const wrapper = mountMaterial(byKey('cx-element-plus-result'), {
      icon: 'success',
      title: '提交成功',
      subTitle: '将在 3 秒后返回',
    })
    // EP 2.14.3 的状态类落在图标 svg（icon-success）而非根元素修饰符
    expect(wrapper.find('.el-result .icon-success').exists()).toBe(true)
    expect(wrapper.text()).toContain('提交成功')
    expect(wrapper.text()).toContain('将在 3 秒后返回')
  })

  it('cx-element-plus-empty 渲染 description', () => {
    const wrapper = mountMaterial(byKey('cx-element-plus-empty'), { description: '暂无记录' })
    expect(wrapper.find('.el-empty').exists()).toBe(true)
    expect(wrapper.text()).toContain('暂无记录')
  })

  it('cx-element-plus-avatar src 到达 EP prop', () => {
    const wrapper = mountMaterial(byKey('cx-element-plus-avatar'), {
      src: 'https://example.com/a.png',
      shape: 'square',
    })
    const img = wrapper.find('.el-avatar img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('https://example.com/a.png')
    expect(wrapper.find('.el-avatar--square').exists()).toBe(true)
  })

  it('cx-element-plus-progress percentage 渲染', () => {
    const wrapper = mountMaterial(byKey('cx-element-plus-progress'), { percentage: 42 })
    expect(wrapper.find('.el-progress').exists()).toBe(true)
    expect(wrapper.text()).toContain('42%')
  })

  it('cx-element-plus-statistic 渲染 title 与 value', () => {
    const wrapper = mountMaterial(byKey('cx-element-plus-statistic'), {
      title: '日活',
      value: 1234,
    })
    expect(wrapper.find('.el-statistic').exists()).toBe(true)
    expect(wrapper.text()).toContain('日活')
    // EP ElStatistic 默认按千分位格式化数值
    expect(wrapper.text()).toContain('1,234')
  })

  it('cx-element-plus-divider 渲染分隔线与 label 文本', () => {
    const wrapper = mountMaterial(byKey('cx-element-plus-divider'), { label: '分组' })
    expect(wrapper.find('.el-divider').exists()).toBe(true)
    expect(wrapper.text()).toContain('分组')
  })
})

describe('B label 插槽类', () => {
  it('cx-element-plus-link 渲染文本与 type', () => {
    const wrapper = mountMaterial(byKey('cx-element-plus-link'), {
      label: '跳转文档',
      type: 'primary',
    })
    expect(wrapper.find('.el-link--primary').exists()).toBe(true)
    expect(wrapper.text()).toContain('跳转文档')
  })

  it('cx-element-plus-tag 渲染文本与 effect', () => {
    const wrapper = mountMaterial(byKey('cx-element-plus-tag'), {
      label: '已上线',
      type: 'success',
      effect: 'dark',
    })
    expect(wrapper.find('.el-tag--success').exists()).toBe(true)
    expect(wrapper.find('.el-tag--dark').exists()).toBe(true)
    expect(wrapper.text()).toContain('已上线')
  })

  it('cx-element-plus-badge 渲染 value 与内容', () => {
    const wrapper = mountMaterial(byKey('cx-element-plus-badge'), {
      value: 5,
      content: '消息',
    })
    expect(wrapper.find('.el-badge').exists()).toBe(true)
    expect(wrapper.find('.el-badge__content').exists()).toBe(true)
    expect(wrapper.text()).toContain('消息')
  })
})

describe('C JSON 子组件类', () => {
  it('cx-element-plus-descriptions 渲染 label/value 条目', () => {
    const wrapper = mountMaterial(byKey('cx-element-plus-descriptions'), {
      title: '用户信息',
      items: [
        { label: '姓名', value: 'Alice' },
        { label: '角色', value: '管理员' },
      ],
    })
    expect(wrapper.find('.el-descriptions').exists()).toBe(true)
    expect(wrapper.text()).toContain('姓名')
    expect(wrapper.text()).toContain('Alice')
    expect(wrapper.text()).toContain('角色')
  })

  it('cx-element-plus-steps 按 active 渲染步骤', () => {
    const wrapper = mountMaterial(byKey('cx-element-plus-steps'), {
      active: 1,
      steps: [{ title: '解析' }, { title: '执行' }, { title: '收尾' }],
    })
    expect(wrapper.find('.el-steps').exists()).toBe(true)
    expect(wrapper.text()).toContain('解析')
    expect(wrapper.text()).toContain('收尾')
    expect(wrapper.findAll('.el-step').length).toBe(3)
  })

  it('cx-element-plus-breadcrumb 渲染面包屑项', () => {
    const wrapper = mountMaterial(byKey('cx-element-plus-breadcrumb'), {
      items: [{ label: '首页' }, { label: '详情' }],
    })
    expect(wrapper.find('.el-breadcrumb').exists()).toBe(true)
    expect(wrapper.findAll('.el-breadcrumb__item').length).toBe(2)
    expect(wrapper.text()).toContain('详情')
  })

  it('cx-element-plus-timeline 渲染时间线条目', () => {
    const wrapper = mountMaterial(byKey('cx-element-plus-timeline'), {
      items: [
        { content: '创建任务', timestamp: '2026-07-30', type: 'primary' },
        { content: '完成任务', timestamp: '2026-07-31' },
      ],
    })
    expect(wrapper.find('.el-timeline').exists()).toBe(true)
    expect(wrapper.findAll('.el-timeline-item').length).toBe(2)
    expect(wrapper.text()).toContain('创建任务')
    expect(wrapper.text()).toContain('2026-07-30')
  })

  it('cx-element-plus-timeline class 贯通（cx-styles 绑定不被包装层丢弃）', () => {
    const wrapper = mountMaterial(byKey('cx-element-plus-timeline'), {
      items: [{ content: '事件' }],
      class: 'custom-cls',
    })
    expect(wrapper.find('.el-timeline.custom-cls').exists()).toBe(true)
  })
})
