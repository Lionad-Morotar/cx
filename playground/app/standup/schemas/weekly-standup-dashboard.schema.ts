import type { CxComponentRuntime } from '@lionad/cx-definition'

/**
 * 周会详情页的页面结构 schema（静态骨架）。
 *
 * 与日会 schema 同构，差异仅在 slot 名（page-layout 物料 normalize 时声明的 5 个
 * 具名 slot 名不同）与对应内容物料。动态数据由各内容物料自行从 store 消费。
 *
 * 原 cx-weekly-standard-dashboard-page 胖容器已移除——standupID 校验迁入 view。
 */

const node = (
  id: string,
  key: string,
  children: Record<string, CxComponentRuntime[]> = {},
  data: Record<string, unknown> = {},
): CxComponentRuntime =>
  ({
    id,
    key,
    name: id,
    data,
    components: children,
    parents: [],
    aliasKeys: [],
    props: {},
    emits: {},
    exposes: {},
  }) as CxComponentRuntime

export const weeklyStandupDashboardSchema: CxComponentRuntime[] = [
  node('weekly-page-root', 'cx-weekly-standup-dashboard-page-layout', {
    'page-header-center': [node('user-info-and-time', 'cx-weekly-user-info-and-time')],
    'page-header-right': [node('page-actions', 'cx-weekly-page-actions')],
    'page-main-section': [node('main-content', 'cx-weekly-main-content')],
    'page-aside-section': [node('todo-card', 'cx-weekly-todo-card')],
    'page-right-section': [node('user-select', 'cx-user-select', {}, { enableKeyboardControl: true })],
  }),
]
