import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { NCheckboxGroup, NDatePicker, NRadioGroup, NRate, NSelect, NSwitch } from 'naive-ui'
import { nextTick } from 'vue'

import { CxNaiveUi } from '../src/index'

/**
 * 表单物料：值注入（value 键，naive 双向约定）+ 变更上行三族断言。
 *
 * 上行通道取证（naive-ui es 源码调用点）：
 * - 透传族：NInput 声明 onInput 函数 prop（Input.mjs:77）；NSelect call(onChange, value, option)
 *   （Select.mjs:335）——v-bind 直达，测试经 naive 组件接收到的函数 prop 触发验证接线；
 * - 桥接族：NSwitch/NRate 等仅 onUpdateValue，wrapper 模板 @update:value 编译为 onUpdateValue
 *   函数 prop 被 naive 内部调用 → 桥接至 attrs.onChange，测试同样经接收到的函数 prop 触发；
 * - date-picker：onChange 为废弃函数 prop（内部仍调用，不剥离会双发），wrapper 经非废弃的
 *   update:formatted-value 桥接，载荷为格式化字符串。
 * naive 内部调用点已源码取证，故此处断言「函数 prop 到达 + 桥接递交」即闭合全链。
 */
const fakeComp = (key: string) => ({ id: `test-${key}`, key, data: {}, components: {} })

const mountMaterial = (comp: any, props: Record<string, any> = {}) =>
  mount(comp, {
    props: { comp: fakeComp(comp._cx_meta?.key || 'x'), ...props },
  })

const byKey = (key: string) => CxNaiveUi.find((x: any) => x._cx_meta.key === key)!

describe('表单值注入（value 键下行）', () => {
  it('input-number value 到达内部 input DOM', async () => {
    const wrapper = mountMaterial(byKey('cx-naive-ui-input-number'), { value: 3 })
    await nextTick()
    const input = wrapper.find('input')
    expect(input.exists()).toBe(true)
    expect((input.element as HTMLInputElement).value).toBe('3')
  })

  it('switch value=true 到达选中态', () => {
    const wrapper = mountMaterial(byKey('cx-naive-ui-switch'), { value: true })
    const el = wrapper.find('.n-switch')
    expect(el.exists()).toBe(true)
    // naive switch 选中态经 aria-checked 与 active 类表达，任一命中即值已下行
    const checked = el.attributes('aria-checked') === 'true' || el.classes().some((c) => c.includes('active'))
    expect(checked).toBe(true)
  })

  it('select options + value 可挂载且渲染选项元数据', () => {
    const wrapper = mountMaterial(byKey('cx-naive-ui-select'), {
      options: [
        { label: '甲', value: 'a' },
        { label: '乙', value: 'b' },
      ],
      value: 'a',
    })
    expect(wrapper.find('.n-base-selection').exists()).toBe(true)
  })

  it('radio-group options 驱动渲染选项文本（双 tick）', async () => {
    const wrapper = mountMaterial(byKey('cx-naive-ui-radio-group'), {
      options: [
        { label: '甲', value: 'a' },
        { label: '乙', value: 'b' },
      ],
      value: 'a',
    })
    await nextTick()
    await nextTick()
    expect(wrapper.find('.n-radio-group').exists()).toBe(true)
    expect(wrapper.text()).toContain('甲')
    expect(wrapper.text()).toContain('乙')
  })

  it('checkbox-group options 驱动渲染选项文本（双 tick）', async () => {
    const wrapper = mountMaterial(byKey('cx-naive-ui-checkbox-group'), {
      options: [{ label: '甲', value: 'a' }],
      value: ['a'],
    })
    await nextTick()
    await nextTick()
    expect(wrapper.find('.n-checkbox-box-wrapper').exists() || wrapper.find('.n-checkbox').exists()).toBe(true)
    expect(wrapper.text()).toContain('甲')
  })

  it('rate value 注入可挂载', () => {
    const wrapper = mountMaterial(byKey('cx-naive-ui-rate'), { value: 3 })
    expect(wrapper.find('.n-rate').exists()).toBe(true)
  })

  it('slider value 注入可挂载', () => {
    const wrapper = mountMaterial(byKey('cx-naive-ui-slider'), { value: 40 })
    expect(wrapper.find('.n-slider').exists()).toBe(true)
  })

  it('date-picker 非法 formattedValue 守卫：回退空态而非整棵子树消失', async () => {
    // 低代码示例文本回填 / 用户脏配置经 date-fns 解析会抛 RangeError 致子树为空，
    // wrapper 守卫剥除非法值——控件仍渲染（空输入框）
    const wrapper = mountMaterial(byKey('cx-naive-ui-date-picker'), {
      formattedValue: '日期选择示例',
      valueFormat: 'yyyy-MM-dd',
    })
    await nextTick()
    expect(wrapper.find('.n-date-picker').exists()).toBe(true)
  })

  it('date-picker 守卫与抛错源同源：token 不匹配的宽松日期串（斜杠）亦剥除', async () => {
    // new Date 能解析 '2026/01/01' 但 date-fns strictParse 按 yyyy-MM-dd token 解析失败——
    // 守卫判定源必须与 naive 抛错源（date-fns parse）同源，否则该窗口静默消失
    const wrapper = mountMaterial(byKey('cx-naive-ui-date-picker'), {
      formattedValue: '2026/01/01',
      valueFormat: 'yyyy-MM-dd',
    })
    await nextTick()
    expect(wrapper.find('.n-date-picker').exists()).toBe(true)
    const input = wrapper.find('input')
    expect((input.element as HTMLInputElement).value).not.toContain('2026/01/01')
  })

  it('date-picker formattedValue 字符串到达内部 input DOM（happy-dom 挂载不崩）', async () => {
    const wrapper = mountMaterial(byKey('cx-naive-ui-date-picker'), {
      formattedValue: '2026-07-30',
      valueFormat: 'yyyy-MM-dd',
    })
    await nextTick()
    expect(wrapper.find('.n-date-picker').exists()).toBe(true)
    const input = wrapper.find('input')
    expect((input.element as HTMLInputElement).value).toContain('2026-07-30')
  })
})

describe('变更上行（三族通道）', () => {
  it('透传族 select：onChange 函数 prop 到达 NSelect，调用即上行', () => {
    const onChange = vi.fn()
    const wrapper = mountMaterial(byKey('cx-naive-ui-select'), {
      options: [{ label: '乙', value: 'b' }],
      onChange,
    })
    const select = wrapper.findComponent(NSelect)
    // v-bind 的 onChange 应作为函数 prop 落在 NSelect 上（Select.mjs:335 call(onChange, value, option)）
    expect(typeof select.props('onChange')).toBe('function')
    ;(select.props('onChange') as (...args: unknown[]) => void)('b', { label: '乙', value: 'b' })
    expect(onChange).toHaveBeenCalledWith('b', { label: '乙', value: 'b' })
  })

  it('桥接族 switch：onUpdateValue 触发 → 桥接递交 attrs.onChange', () => {
    const onChange = vi.fn()
    const wrapper = mountMaterial(byKey('cx-naive-ui-switch'), { value: false, onChange })
    const sw = wrapper.findComponent(NSwitch)
    // wrapper @update:value 编译为 onUpdateValue 函数 prop，naive 内部调用即触发桥接
    ;(sw.props('onUpdate:value') as (v: unknown) => void)(true)
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('桥接族 rate：onUpdateValue 触发 → 桥接递交新值', () => {
    const onChange = vi.fn()
    const wrapper = mountMaterial(byKey('cx-naive-ui-rate'), { value: 2, onChange })
    const rate = wrapper.findComponent(NRate)
    ;(rate.props('onUpdate:value') as (v: unknown) => void)(4)
    expect(onChange).toHaveBeenCalledWith(4)
  })

  it('桥接族 radio-group / checkbox-group：组 onUpdateValue 触发 → 桥接递交', () => {
    const onRadioChange = vi.fn()
    const radioWrapper = mountMaterial(byKey('cx-naive-ui-radio-group'), {
      options: [
        { label: '甲', value: 'a' },
        { label: '乙', value: 'b' },
      ],
      onChange: onRadioChange,
    })
    ;(radioWrapper.findComponent(NRadioGroup).props('onUpdate:value') as (v: unknown) => void)('b')
    expect(onRadioChange).toHaveBeenCalledWith('b')

    const onCheckboxChange = vi.fn()
    const checkboxWrapper = mountMaterial(byKey('cx-naive-ui-checkbox-group'), {
      options: [{ label: '甲', value: 'a' }],
      onChange: onCheckboxChange,
    })
    ;(checkboxWrapper.findComponent(NCheckboxGroup).props('onUpdate:value') as (v: unknown) => void)(['a'])
    expect(onCheckboxChange).toHaveBeenCalledWith(['a'])
  })

  it('date-picker：onUpdateFormattedValue 桥接载荷为字符串而非时间戳', () => {
    const onChange = vi.fn()
    const wrapper = mountMaterial(byKey('cx-naive-ui-date-picker'), {
      formattedValue: '2026-07-30',
      valueFormat: 'yyyy-MM-dd',
      onChange,
    })
    const picker = wrapper.findComponent(NDatePicker)
    ;(picker.props('onUpdate:formattedValue') as (v: unknown) => void)('2026-07-31')
    expect(onChange).toHaveBeenCalledWith('2026-07-31')
  })

  it('桥接族不双发：forwarded 载荷不含 onChange（废弃 prop / 死监听器防护）', () => {
    const onChange = vi.fn()
    const wrapper = mountMaterial(byKey('cx-naive-ui-switch'), { value: false, onChange })
    const sw = wrapper.findComponent(NSwitch)
    // onChange 不得作为 prop 落在 NSwitch 上（避免废弃 onChange prop 与桥接双发）
    expect(sw.props('onChange')).toBeUndefined()
  })
})
