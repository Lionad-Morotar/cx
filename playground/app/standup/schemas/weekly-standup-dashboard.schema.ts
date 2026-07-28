import { cxNode, type CxComponentRuntime } from '@lionad/cx-definition'

/**
 * 周会详情页的页面结构 schema（静态骨架）。
 *
 * 与日会 schema 同构，差异仅在 slot 名（page-layout 物料 defineCxComponent 时声明的 5 个
 * 具名 slot 名不同）与对应内容物料。动态数据由各内容物料自行从 store 消费。
 *
 * 原 cx-weekly-standard-dashboard-page 胖容器已移除——standupID 校验迁入 view。
 */

export const weeklyStandupDashboardSchema: CxComponentRuntime[] = [
  cxNode('weekly-page-root', 'cx-weekly-standup-dashboard-page-layout', {
    'page-header-center': [cxNode('user-info-and-time', 'cx-weekly-user-info-and-time')],
    'page-header-right': [cxNode('page-actions', 'cx-weekly-page-actions')],
    'page-main-section': [cxNode('main-content', 'cx-weekly-main-content')],
    'page-aside-section': [cxNode('todo-card', 'cx-weekly-todo-card')],
    'page-right-section': [
      cxNode('user-select', 'cx-user-select', {}, { enableKeyboardControl: true }),
    ],
  }),
]
