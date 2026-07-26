import { describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

import { CxRender } from '@lionad/cx-render'

import CxFolderContainer from '../app/standup/components/folder-container'
import CxStandupCard from '../app/standup/components/standup-card'
import CxStandupCardList from '../app/standup/components/standup-card-list'
import CxStandupGroupHeader from '../app/standup/components/standup-group-header'
import CxStandupGroupList from '../app/standup/components/standup-group-list'
import { comp, createTestCx, installMaterials } from './helpers/cx-render-test'

import type { CxComponentRuntime } from '@lionad/cx-definition'
import type { GroupOfStandups } from '../app/standup/apis'

/**
 * 站会列表页 schema 化的机制验证（card-tabs 模板 slot 循环 + Provider 注入）。
 *
 * 核心命题：group-item / card-item 模板插槽种类固定，渲染数量由 groups / standups
 * 数据长度驱动；每个实例经 StandupContextProvider 拿到自己的 group / standup。
 * groups 经 schema data 注入（测试缝隙），standups 由 group-list 提供的 group 派生。
 */

const groups: GroupOfStandups = [
  {
    offsetCount: 2,
    startDay: '2026/07/14',
    endDay: '2026/07/20',
    standups: [
      {
        id: 's1',
        name: '站会一',
        created: '',
        createdBy: '',
        meetingDate: '2026-07-14',
        startTime: '10:00',
        endTime: '10:15',
        state: 'ENDED',
        participants: [],
      },
      {
        id: 's2',
        name: '站会二',
        created: '',
        createdBy: '',
        meetingDate: '2026-07-15',
        startTime: '10:00',
        endTime: '',
        state: 'IN_PROGRESS',
        participants: [],
      },
    ],
  },
  {
    offsetCount: 1,
    startDay: '2026/07/07',
    endDay: '2026/07/13',
    standups: [
      {
        id: 's3',
        name: '站会三',
        created: '',
        createdBy: '',
        meetingDate: '2026-07-07',
        startTime: '10:00',
        endTime: '10:20',
        state: 'ENDED',
        participants: [],
      },
    ],
  },
]

// group-list 下挂一个 folder-container 模板；folder 的 header/content 各挂模板子节点
const schema = [
  comp(
    'group-list',
    'cx-standup-group-list',
    { groups },
    {
      'group-item': [
        comp(
          'folder',
          'cx-folder-container',
          {},
          {
            header: [comp('group-header', 'cx-standup-group-header', {}, {}, ['folder'])],
            content: [
              comp(
                'card-list',
                'cx-standup-card-list',
                {},
                { 'card-item': [comp('card', 'cx-standup-card', {}, {}, ['card-list'])] },
                ['folder'],
              ),
            ],
          },
          ['group-list'],
        ),
      ],
    },
  ),
]

const mountPage = async () => {
  const cx = createTestCx()
  installMaterials(cx, {
    CxFolderContainer,
    CxStandupCard,
    CxStandupCardList,
    CxStandupGroupHeader,
    CxStandupGroupList,
  })
  const wrapper = mount(CxRender, { props: { cx: cx as never, components: schema } })
  await flushPromises()
  await flushPromises()
  return wrapper
}

describe('站会列表页 schema：模板 slot 循环 + Provider 注入', () => {
  it('group-item 模板渲染出与 groups 数量一致的 folder-container', async () => {
    const wrapper = await mountPage()
    const folders = wrapper.findAll('[data-cx-comp-key="cx-folder-container"]')
    expect(folders.length).toBe(groups.length)
  })

  it('card-item 模板渲染出与各组 standups 数量一致的卡片，且各卡片拿到自己的 standup', async () => {
    const wrapper = await mountPage()
    const cards = wrapper.findAll('[data-cx-comp-key="cx-standup-card"]')
    const totalStandups = groups.reduce((n, g) => n + g.standups.length, 0)
    expect(cards.length).toBe(totalStandups)

    // 三张卡片各自的 meetingDate 都出现，证明 Provider 注入的是不同 standup
    const text = wrapper.text()
    expect(text).toContain('2026/07/14')
    expect(text).toContain('2026/07/15')
    expect(text).toContain('2026/07/07')
  })

  it('分组头部经 Provider 拿到 group 数据（日期范围渲染正确）', async () => {
    const wrapper = await mountPage()
    const headers = wrapper.findAll('[data-cx-comp-key="cx-standup-group-header"]')
    expect(headers.length).toBe(groups.length)
    const text = wrapper.text()
    expect(text).toContain('2026/07/14')
    expect(text).toContain('2026/07/07')
  })
})

describe('站会列表页 schema 结构（静态骨架）', () => {
  // CxComponentRuntime 的递归类型在嵌套访问时退化为内层基础类型（与 index.vue 一致，需 cast）
  const asComp = (x: unknown) => x as CxComponentRuntime

  it('根为 page-main，布局容器下挂四区域', async () => {
    const { standupListSchema } = await import('../app/standup/schemas/standup-list.schema')
    const root = asComp(standupListSchema[0])
    expect(root.key).toBe('cx-page-main')
    const layout = asComp(root.components?.default?.[0])
    expect(layout.key).toBe('cx-standup-list-layout')
    const children = (layout.components?.default ?? []).map((c) => asComp(c).key)
    expect(children).toEqual(
      expect.arrayContaining([
        'cx-standup-header-bar',
        'cx-standup-list-main',
        'cx-standup-member-draggable',
        'cx-select-participants-dialog',
      ]),
    )
  })

  it('分组与卡片经模板插槽（group-item / card-item）嵌套', async () => {
    const { standupListSchema } = await import('../app/standup/schemas/standup-list.schema')
    const layout = asComp(asComp(standupListSchema[0]).components?.default?.[0])
    const listMain = asComp(
      (layout.components?.default ?? []).find((c) => asComp(c).key === 'cx-standup-list-main'),
    )
    const groupList = asComp(listMain.components?.default?.[0])
    expect(groupList.key).toBe('cx-standup-group-list')

    const folder = asComp(groupList.components?.['group-item']?.[0])
    expect(folder.key).toBe('cx-folder-container')
    expect(asComp(folder.components?.header?.[0]).key).toBe('cx-standup-group-header')

    const cardList = asComp(folder.components?.content?.[0])
    expect(cardList.key).toBe('cx-standup-card-list')
    expect(asComp(cardList.components?.['card-item']?.[0]).key).toBe('cx-standup-card')
  })
})
