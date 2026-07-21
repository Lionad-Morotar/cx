import { cxNode, type CxComponentRuntime } from '@lionad/cx-definition'

/**
 * 站会列表页的页面结构 schema（静态骨架）。
 *
 * 整页由这一棵 CxComponentRuntime 树描述、经 CxRender 渲染：
 * 动态数据（分组/卡片/成员/会议类型）由各容器物料自行从 store 消费，
 * 动态数量（分组数/卡片数）经 card-tabs 式模板插槽循环展开，schema 本身保持静态。
 */

export const standupListSchema: CxComponentRuntime[] = [
  cxNode('page-root', 'cx-page-main', {
    default: [
      cxNode('list-layout', 'cx-standup-list-layout', {
        default: [
          cxNode('header-bar', 'cx-standup-header-bar'),
          cxNode('list-main', 'cx-standup-list-main', {
            default: [
              cxNode('group-list', 'cx-standup-group-list', {
                'group-item': [
                  cxNode('folder', 'cx-folder-container', {
                    header: [cxNode('group-header', 'cx-standup-group-header')],
                    content: [
                      cxNode('card-list', 'cx-standup-card-list', {
                        'card-item': [cxNode('standup-card', 'cx-standup-card')],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          cxNode('member-draggable', 'cx-standup-member-draggable'),
          cxNode('participants-dialog', 'cx-select-participants-dialog'),
        ],
      }),
    ],
  }),
]
