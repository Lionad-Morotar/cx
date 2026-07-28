import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref, useAttrs } from 'vue'

import { useVtuProps } from '../src/shared/use-vtu-props'

// 增量渲染场景契约：CxRender 每帧把新数据对象经 attrs 灌入包装层
// （行数组逐帧变长、引用逐帧替换），提纯结果必须跟随更新。
// 回归场景：提纯停在挂载首帧——增量面板行数 badge 在涨而组件画面不更新。

const Probe = defineComponent({
  inheritAttrs: false,
  setup() {
    const vtuProps = useVtuProps<{ rows: { a: number }[] }>(useAttrs(), 'probe-fallback')
    return () => h('pre', JSON.stringify(vtuProps.value))
  },
})

describe('useVtuProps 增量帧契约', () => {
  it('父层经 attrs 灌入新数据帧时，提纯结果跟随更新', async () => {
    const rows = ref([{ a: 1 }])
    const Root = defineComponent({
      setup() {
        return () => h(Probe, { rows: rows.value })
      },
    })
    const wrapper = mount(Root)
    expect(JSON.parse(wrapper.text()).rows).toHaveLength(1)

    rows.value = [{ a: 1 }, { a: 2 }]
    await nextTick()
    expect(JSON.parse(wrapper.text()).rows).toHaveLength(2)

    rows.value = [{ a: 1 }, { a: 2 }, { a: 3 }]
    await nextTick()
    expect(JSON.parse(wrapper.text()).rows).toHaveLength(3)
  })

  it('剥离 comp 与 data-、下划线前缀键，id 回退到 comp.id', () => {
    const Root = defineComponent({
      setup() {
        return () =>
          h(Probe, {
            comp: { id: 'c1', key: 'cx-vtu-data-table' },
            'data-testid': 'x',
            _internal: 1,
            rows: [],
          })
      },
    })
    const wrapper = mount(Root)
    const out = JSON.parse(wrapper.text())
    expect(out).toEqual({ rows: [], id: 'c1' })
  })
})
