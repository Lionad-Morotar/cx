import { cxNode, type CxComponentRuntime } from '@lionad/cx-definition'

/**
 * 日会详情页的页面结构 schema（静态骨架）。
 *
 * 整页由这一棵 CxComponentRuntime 树描述、经 CxRender 渲染：根为 page-layout 物料，
 * 5 个具名 slot（page-layout 物料 defineCxComponent 时声明）各填一个内容物料。动态数据由各
 * 内容物料自行从 store 消费，schema 仅承载结构。
 *
 * 原 cx-daily-standard-dashboard-page 胖容器（用 Vue 编译期 <template #> 分配 slot）
 * 已移除——其分配职责由本 schema 的父子嵌套表达，standupID 校验迁入 view。
 */

export const dailyStandupDashboardSchema: CxComponentRuntime[] = [
  cxNode('daily-page-root', 'cx-daily-standard-dashboard-page-layout', {
    'page-header': [cxNode('header-info', 'cx-daily-standup-header-info')],
    'page-header-right': [cxNode('page-actions', 'cx-daily-page-actions')],
    'page-content-left': [cxNode('filter', 'cx-daily-standup-filter')],
    'page-content-main': [cxNode('main-content', 'cx-daily-main-content')],
    'page-content-right': [
      cxNode('user-select', 'cx-user-select', {}, { enableKeyboardControl: true }),
    ],
  }),
]
