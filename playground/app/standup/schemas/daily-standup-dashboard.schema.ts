import type { CxComponentRuntime } from '@lionad/cx-definition'

/**
 * 日会详情页的页面结构 schema（静态骨架）。
 *
 * 整页由这一棵 CxComponentRuntime 树描述、经 CxRender 渲染：根为 page-layout 物料，
 * 5 个具名 slot（page-layout 物料 normalize 时声明）各填一个内容物料。动态数据由各
 * 内容物料自行从 store 消费，schema 仅承载结构。
 *
 * 原 cx-daily-standard-dashboard-page 胖容器（用 Vue 编译期 <template #> 分配 slot）
 * 已移除——其分配职责由本 schema 的父子嵌套表达，standupID 校验迁入 view。
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

export const dailyStandupDashboardSchema: CxComponentRuntime[] = [
  node('daily-page-root', 'cx-daily-standard-dashboard-page-layout', {
    'page-header': [node('header-info', 'cx-daily-standup-header-info')],
    'page-header-right': [node('page-actions', 'cx-daily-page-actions')],
    'page-content-left': [node('filter', 'cx-daily-standup-filter')],
    'page-content-main': [node('main-content', 'cx-daily-main-content')],
    'page-content-right': [node('user-select', 'cx-user-select', {}, { enableKeyboardControl: true })],
  }),
]
