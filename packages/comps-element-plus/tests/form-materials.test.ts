import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

import { CxElementPlus } from '../src/index'

/**
 * S3 表单物料 9 件：值下行（modelValue 经 attrs 透传到达控件）
 * + 变更上行（on* 监听器经桥接 v-bind 到 EP 组件，D5 原生事件通道）。
 */
const fakeComp = (key: string) => ({ id: `test-${key}`, key, data: {}, components: {} })

const mountMaterial = (comp: any, props: Record<string, any> = {}) =>
  mount(comp, {
    props: { comp: fakeComp(comp._cx_meta?.key || 'x'), ...props },
    attachTo: document.body,
  })

const byKey = (key: string) => CxElementPlus.find((x: any) => x._cx_meta.key === key)!

describe('基础录入类', () => {
  it('cx-element-plus-input modelValue 到达内部 input', () => {
    const wrapper = mountMaterial(byKey('cx-element-plus-input'), {
      modelValue: 'hello',
      placeholder: '请输入',
    })
    const input = wrapper.find('input')
    expect((input.element as HTMLInputElement).value).toBe('hello')
    expect(input.attributes('placeholder')).toBe('请输入')
  })

  it('cx-element-plus-input 输入事件上行（onInput 监听器经桥接到达 EP 组件）', async () => {
    const onInput = vi.fn()
    const wrapper = mountMaterial(byKey('cx-element-plus-input'), { modelValue: '', onInput })
    await wrapper.find('input').setValue('cx')
    expect(onInput).toHaveBeenCalledWith('cx')
  })

  it('cx-element-plus-input-number modelValue 渲染', () => {
    const wrapper = mountMaterial(byKey('cx-element-plus-input-number'), { modelValue: 3 })
    const input = wrapper.find('.el-input-number input')
    expect((input.element as HTMLInputElement).value).toBe('3')
  })

  it('cx-element-plus-switch modelValue=true 选中态，点击上报 onChange', async () => {
    const onChange = vi.fn()
    const wrapper = mountMaterial(byKey('cx-element-plus-switch'), {
      modelValue: true,
      onChange,
    })
    expect(wrapper.find('.el-switch.is-checked').exists()).toBe(true)
    await wrapper.find('.el-switch').trigger('click')
    expect(onChange).toHaveBeenCalledWith(false)
  })
})

describe('选项驱动类', () => {
  it('cx-element-plus-select 渲染选中值', async () => {
    const wrapper = mountMaterial(byKey('cx-element-plus-select'), {
      modelValue: 'a',
      options: [
        { label: '甲', value: 'a' },
        { label: '乙', value: 'b' },
      ],
    })
    expect(wrapper.find('.el-select').exists()).toBe(true)
    // EP 选中标签在 ElOption 注册后的下一 tick 解析（选项 onMounted 登记缓存，select 再渲染）
    await nextTick()
    expect(wrapper.find('.el-select__placeholder').text()).toContain('甲')
  })

  it('cx-element-plus-radio-group 渲染选项与选中态', () => {
    const wrapper = mountMaterial(byKey('cx-element-plus-radio-group'), {
      modelValue: 'x',
      options: [
        { label: 'X 项', value: 'x' },
        { label: 'Y 项', value: 'y' },
      ],
    })
    expect(wrapper.findAll('.el-radio').length).toBe(2)
    expect(wrapper.find('.el-radio.is-checked').exists()).toBe(true)
    expect(wrapper.text()).toContain('X 项')
  })

  it('cx-element-plus-checkbox-group 渲染选项', () => {
    const wrapper = mountMaterial(byKey('cx-element-plus-checkbox-group'), {
      modelValue: ['x'],
      options: [
        { label: 'X 项', value: 'x' },
        { label: 'Y 项', value: 'y' },
      ],
    })
    expect(wrapper.findAll('.el-checkbox').length).toBe(2)
    expect(wrapper.text()).toContain('Y 项')
  })
})

describe('特殊控件类', () => {
  it('cx-element-plus-date-picker 可挂载（happy-dom 下 popper 不崩）', () => {
    const wrapper = mountMaterial(byKey('cx-element-plus-date-picker'), {
      modelValue: '',
      placeholder: '选日期',
    })
    expect(wrapper.find('.el-date-editor').exists()).toBe(true)
  })

  it('cx-element-plus-rate modelValue 渲染激活星数', () => {
    const wrapper = mountMaterial(byKey('cx-element-plus-rate'), { modelValue: 3 })
    expect(wrapper.find('.el-rate').exists()).toBe(true)
    expect(wrapper.findAll('.el-rate__item').length).toBe(5)
  })

  it('cx-element-plus-slider 可挂载', () => {
    const wrapper = mountMaterial(byKey('cx-element-plus-slider'), { modelValue: 30 })
    expect(wrapper.find('.el-slider').exists()).toBe(true)
  })
})
